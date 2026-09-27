from datetime import date
from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (Program, Trainer, Appointment, MembershipPlan, Membership,
                      GymClass, ClassSchedule, ClassBooking)
from .serializers import (ProgramSerializer, TrainerSerializer, AppointmentSerializer,
                           MembershipPlanSerializer, MembershipSerializer,
                           GymClassSerializer, ClassScheduleSerializer, ClassBookingSerializer)
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdmin


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.filter(is_active=True).prefetch_related('availability', 'programs')
    serializer_class = TrainerSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class MembershipPlanViewSet(viewsets.ModelViewSet):
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdminOrReadOnly]


class GymClassViewSet(viewsets.ModelViewSet):
    queryset = GymClass.objects.filter(is_active=True).prefetch_related('schedules')
    serializer_class = GymClassSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class ClassScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClassSchedule.objects.select_related('gym_class').all()
    serializer_class = ClassScheduleSerializer
    permission_classes = [IsAdminOrReadOnly]


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.select_related('trainer', 'user').all()
        return Appointment.objects.select_related('trainer').filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appt = self.get_object()
        appt.status = 'cancelled'
        appt.save()
        return Response(AppointmentSerializer(appt).data)


class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Membership.objects.select_related('plan', 'user').all()
        return Membership.objects.select_related('plan').filter(user=user)


class ClassBookingViewSet(viewsets.ModelViewSet):
    serializer_class = ClassBookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ClassBooking.objects.select_related('schedule__gym_class', 'user').all()
        return ClassBooking.objects.select_related('schedule__gym_class').filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'cancelled'
        booking.save()
        return Response(ClassBookingSerializer(booking).data)


class AdminStatsView(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        from accounts.models import User
        from payments.models import Payment
        today = date.today()
        data = {
            'total_members': User.objects.filter(is_member=True).count(),
            'total_users': User.objects.count(),
            'active_memberships': Membership.objects.filter(status='active', end_date__gte=today).count(),
            'total_trainers': Trainer.objects.filter(is_active=True).count(),
            'total_programs': Program.objects.filter(is_active=True).count(),
            'pending_appointments': Appointment.objects.filter(status='pending').count(),
            'upcoming_class_bookings': ClassBooking.objects.filter(status__in=['pending', 'confirmed']).count(),
            'total_revenue': float(Payment.objects.filter(status='success').aggregate(
                total=Sum('amount'))['total'] or 0),
            'recent_payments': list(Payment.objects.filter(status='success').order_by('-created_at')[:5].values(
                'id', 'amount', 'purpose', 'created_at', 'user__username')),
        }
        return Response(data)
