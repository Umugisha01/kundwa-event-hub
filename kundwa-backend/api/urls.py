from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    EventViewSet, ServiceViewSet, EquipmentViewSet, BookingViewSet, TicketViewSet,
    ChatMessageViewSet, FooterSettingsViewSet, HeroSettingsViewSet, PortfolioViewSet, ContactSubmissionViewSet,
    TestimonialViewSet, TrustedBrandViewSet, SiteStatisticViewSet,
    ProfileViewSet, UserRoleViewSet,
    RegisterView, CustomTokenObtainPairView, FileUploadView, HealthCheckView
)

router = DefaultRouter()
router.register('events', EventViewSet, basename='events')
router.register('services', ServiceViewSet, basename='services')
router.register('equipment', EquipmentViewSet, basename='equipment')
router.register('bookings', BookingViewSet, basename='bookings')
router.register('tickets', TicketViewSet, basename='tickets')
router.register('chat_messages', ChatMessageViewSet, basename='chat_messages')
router.register('footer_settings', FooterSettingsViewSet, basename='footer_settings')
router.register('hero_settings', HeroSettingsViewSet, basename='hero_settings')
router.register('portfolio', PortfolioViewSet, basename='portfolio')
router.register('contact_submissions', ContactSubmissionViewSet, basename='contact_submissions')
router.register('testimonials', TestimonialViewSet, basename='testimonials')
router.register('trusted_brands', TrustedBrandViewSet, basename='trusted_brands')
router.register('site_statistics', SiteStatisticViewSet, basename='site_statistics')
router.register('profiles', ProfileViewSet, basename='profiles')
router.register('user_roles', UserRoleViewSet, basename='user_roles')

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('health', HealthCheckView.as_view()),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/register', RegisterView.as_view()),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login', CustomTokenObtainPairView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/refresh', TokenRefreshView.as_view()),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('upload', FileUploadView.as_view()),
    path('', include(router.urls)),
]
