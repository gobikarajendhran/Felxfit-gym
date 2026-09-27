import hmac
import hashlib
import json
from datetime import date, timedelta

import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Payment
from .serializers import PaymentSerializer, CreateOrderSerializer, VerifyPaymentSerializer
from gym.models import MembershipPlan, Membership


def get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create a Razorpay order for a membership plan (or custom amount)."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        plan = None
        amount = data.get('amount')
        purpose = data.get('purpose', 'membership')

        if data.get('membership_plan_id'):
            plan = MembershipPlan.objects.filter(id=data['membership_plan_id']).first()
            if not plan:
                return Response({'detail': 'Invalid membership plan.'}, status=status.HTTP_400_BAD_REQUEST)
            amount = plan.price

        if not amount:
            return Response({'detail': 'Amount or membership_plan_id is required.'},
                             status=status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.create(
            user=request.user, membership_plan=plan, purpose=purpose,
            amount=amount, currency='INR', method='razorpay', status='created',
        )

        try:
            client = get_razorpay_client()
            order = client.order.create({
                'amount': int(float(amount) * 100),  # paise
                'currency': 'INR',
                'receipt': f'flexfit_payment_{payment.id}',
                'notes': {'purpose': purpose, 'payment_id': str(payment.id)},
            })
            payment.razorpay_order_id = order['id']
            payment.save()
        except Exception as exc:
            # Sandbox/no-key fallback so the flow is still testable end-to-end locally
            payment.razorpay_order_id = f'order_local_{payment.id}'
            payment.save()
            return Response({
                'warning': f'Razorpay not fully configured ({str(exc)}). Using local mock order id.',
                'order_id': payment.razorpay_order_id,
                'amount': float(amount),
                'currency': 'INR',
                'key': settings.RAZORPAY_KEY_ID,
                'payment_id': payment.id,
            })

        return Response({
            'order_id': order['id'],
            'amount': float(amount),
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'payment_id': payment.id,
        })

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify Razorpay payment signature after checkout completes on the frontend."""
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        payment = Payment.objects.filter(razorpay_order_id=d['razorpay_order_id'],
                                          user=request.user).first()
        if not payment:
            return Response({'detail': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        verified = False
        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature({
                'razorpay_order_id': d['razorpay_order_id'],
                'razorpay_payment_id': d['razorpay_payment_id'],
                'razorpay_signature': d['razorpay_signature'],
            })
            verified = True
        except Exception:
            verified = False

        if verified:
            payment.razorpay_payment_id = d['razorpay_payment_id']
            payment.razorpay_signature = d['razorpay_signature']
            payment.status = 'success'
            payment.save()

            if payment.purpose in ('membership', 'personal_training') and payment.membership_plan:
                start = date.today()
                end = start + timedelta(days=payment.membership_plan.duration_days)
                Membership.objects.create(user=request.user, plan=payment.membership_plan,
                                           start_date=start, end_date=end, status='active')
                request.user.is_member = True
                request.user.save()

            return Response({'status': 'success', 'payment': PaymentSerializer(payment).data})

        payment.status = 'failed'
        payment.save()
        return Response({'status': 'failed', 'detail': 'Signature verification failed.'},
                         status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def razorpay_webhook(request):
    """Razorpay webhook endpoint: payment.captured / payment.failed events."""
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
    body = request.body

    if webhook_secret:
        signature = request.headers.get('X-Razorpay-Signature', '')
        expected = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            return JsonResponse({'detail': 'Invalid webhook signature.'}, status=400)

    payload = json.loads(body or '{}')
    event = payload.get('event', '')
    entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
    order_id = entity.get('order_id')

    if order_id:
        payment = Payment.objects.filter(razorpay_order_id=order_id).first()
        if payment:
            if event == 'payment.captured':
                payment.status = 'success'
                payment.razorpay_payment_id = entity.get('id', payment.razorpay_payment_id)
            elif event == 'payment.failed':
                payment.status = 'failed'
            payment.save()

    return JsonResponse({'status': 'ok'})
