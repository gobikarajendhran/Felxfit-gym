from django.conf import settings
from django.db import models


class Payment(models.Model):
    PURPOSE = [('membership', 'Membership'), ('personal_training', 'Personal Training'),
                ('class_booking', 'Class Booking')]
    STATUS = [('created', 'Created'), ('success', 'Success'), ('failed', 'Failed')]
    METHOD = [('razorpay', 'Razorpay'), ('upi', 'UPI'), ('card', 'Card')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    membership_plan = models.ForeignKey('gym.MembershipPlan', on_delete=models.SET_NULL,
                                         null=True, blank=True, related_name='payments')
    purpose = models.CharField(max_length=30, choices=PURPOSE, default='membership')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    method = models.CharField(max_length=20, choices=METHOD, default='razorpay')
    status = models.CharField(max_length=20, choices=STATUS, default='created')

    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency} ({self.status})"
