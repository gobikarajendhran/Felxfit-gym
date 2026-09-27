from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'user', 'membership_plan', 'purpose', 'amount', 'currency',
                  'method', 'status', 'razorpay_order_id', 'razorpay_payment_id',
                  'created_at']
        read_only_fields = ['user', 'status', 'razorpay_order_id',
                             'razorpay_payment_id', 'created_at']


class CreateOrderSerializer(serializers.Serializer):
    membership_plan_id = serializers.IntegerField(required=False)
    purpose = serializers.ChoiceField(choices=Payment.PURPOSE, default='membership')
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
