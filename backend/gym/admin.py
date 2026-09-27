from django.contrib import admin
from .models import (Program, Trainer, TrainerAvailability, Appointment,
                      MembershipPlan, Membership, GymClass, ClassSchedule, ClassBooking)


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_weeks', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['is_active']
    search_fields = ['name']


class TrainerAvailabilityInline(admin.TabularInline):
    model = TrainerAvailability
    extra = 1


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'experience_years', 'rating', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['is_active', 'specialization']
    search_fields = ['name']
    inlines = [TrainerAvailabilityInline]
    filter_horizontal = ['programs']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'trainer', 'date', 'time_slot', 'status']
    list_filter = ['status', 'date']
    search_fields = ['user__username', 'trainer__name']
    list_editable = ['status']


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'price', 'duration_days', 'is_popular', 'is_active']
    list_filter = ['plan_type', 'is_active']


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'plan']
    search_fields = ['user__username']
    list_editable = ['status']


class ClassScheduleInline(admin.TabularInline):
    model = ClassSchedule
    extra = 1


@admin.register(GymClass)
class GymClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'trainer', 'capacity', 'duration_minutes', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['is_active']
    inlines = [ClassScheduleInline]


@admin.register(ClassBooking)
class ClassBookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'schedule', 'booking_date', 'status']
    list_filter = ['status', 'booking_date']
    search_fields = ['user__username']
    list_editable = ['status']
