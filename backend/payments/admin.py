from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'amount', 'currency', 'method', 'status', 'created_at']
    list_filter = ['status', 'purpose', 'method']
    search_fields = ['user__username', 'razorpay_order_id', 'razorpay_payment_id']
