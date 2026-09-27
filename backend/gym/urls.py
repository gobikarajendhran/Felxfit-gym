from rest_framework.routers import DefaultRouter
from .views import (ProgramViewSet, TrainerViewSet, MembershipPlanViewSet,
                     GymClassViewSet, ClassScheduleViewSet, AppointmentViewSet,
                     MembershipViewSet, ClassBookingViewSet, AdminStatsView)

router = DefaultRouter()
router.register('programs', ProgramViewSet, basename='program')
router.register('trainers', TrainerViewSet, basename='trainer')
router.register('membership-plans', MembershipPlanViewSet, basename='membershipplan')
router.register('classes', GymClassViewSet, basename='gymclass')
router.register('class-schedules', ClassScheduleViewSet, basename='classschedule')
router.register('appointments', AppointmentViewSet, basename='appointment')
router.register('memberships', MembershipViewSet, basename='membership')
router.register('class-bookings', ClassBookingViewSet, basename='classbooking')
router.register('admin/stats', AdminStatsView, basename='adminstats')

urlpatterns = router.urls
