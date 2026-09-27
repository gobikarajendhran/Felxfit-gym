from rest_framework import viewsets
from .models import Testimonial
from .serializers import TestimonialSerializer
from gym.permissions import IsAdminOrReadOnly


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.filter(is_active=True)
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminOrReadOnly]
