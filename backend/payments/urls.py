from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, razorpay_webhook

router = DefaultRouter()
router.register('', PaymentViewSet, basename='payment')

urlpatterns = [
    path('webhook/', razorpay_webhook, name='razorpay-webhook'),
] + router.urls
