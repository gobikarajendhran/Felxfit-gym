from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'phone', 'is_member', 'is_staff']
    list_filter = ['is_member', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Gym Profile', {'fields': ('phone', 'address', 'date_of_birth', 'profile_image', 'is_member')}),
    )
