from rest_framework import serializers
from .models import (Program, Trainer, TrainerAvailability, Appointment,
                      MembershipPlan, Membership, GymClass, ClassSchedule, ClassBooking)


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'


class TrainerAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerAvailability
        fields = ['id', 'day_of_week', 'start_time', 'end_time']


class TrainerSerializer(serializers.ModelSerializer):
    availability = TrainerAvailabilitySerializer(many=True, read_only=True)
    programs = ProgramSerializer(many=True, read_only=True)

    class Meta:
        model = Trainer
        fields = ['id', 'name', 'slug', 'specialization', 'bio', 'experience_years',
                  'photo', 'rating', 'is_active', 'programs', 'availability']


class AppointmentSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'user', 'user_name', 'trainer', 'trainer_name', 'date',
                  'time_slot', 'status', 'notes', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = '__all__'


class MembershipSerializer(serializers.ModelSerializer):
    plan_detail = MembershipPlanSerializer(source='plan', read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'user', 'plan', 'plan_detail', 'start_date', 'end_date',
                  'status', 'created_at']
        read_only_fields = ['user', 'start_date', 'end_date', 'status', 'created_at']


class ClassScheduleSerializer(serializers.ModelSerializer):
    available_slots = serializers.ReadOnlyField()
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = ClassSchedule
        fields = ['id', 'gym_class', 'day_of_week', 'day_display', 'start_time',
                  'end_time', 'available_slots']


class GymClassSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    schedules = ClassScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = GymClass
        fields = ['id', 'name', 'slug', 'description', 'trainer', 'trainer_name',
                  'capacity', 'duration_minutes', 'image', 'is_active', 'schedules']


class ClassBookingSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='schedule.gym_class.name', read_only=True)
    schedule_detail = ClassScheduleSerializer(source='schedule', read_only=True)

    class Meta:
        model = ClassBooking
        fields = ['id', 'user', 'schedule', 'schedule_detail', 'class_name',
                  'booking_date', 'status', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']
