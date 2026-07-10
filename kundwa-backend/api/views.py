from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.db.models import Q
from .models import (
    Profile, UserRole, Event, Service, Equipment, Booking, Ticket,
    ChatMessage, FooterSettings, Portfolio, ContactSubmission,
    Testimonial, TrustedBrand, SiteStatistic
)
from .serializers import (
    ProfileSerializer, UserRoleSerializer,
    EventSerializer, ServiceSerializer, EquipmentSerializer,
    BookingSerializer, TicketSerializer, ChatMessageSerializer,
    FooterSettingsSerializer, PortfolioSerializer, ContactSubmissionSerializer,
    TestimonialSerializer, TrustedBrandSerializer, SiteStatisticSerializer
)

# Custom Permissions
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.roles.filter(role='admin').exists()

class IsAdminOrInsertOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated and request.user.roles.filter(role='admin').exists()

class BookingPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(role='admin').exists():
            return True
        return obj.user == request.user

class TicketPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(role='admin').exists():
            return True
        return obj.user == request.user

class ChatMessagePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(role='admin').exists():
            return True
        return obj.sender == request.user or obj.receiver == request.user

# ViewSets
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Event.objects.all().order_by('date')
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        return queryset

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Service.objects.all().order_by('name')
        slug = self.request.query_params.get('slug')
        if slug is not None:
            queryset = queryset.filter(slug=slug)
        return queryset

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('name')
    serializer_class = EquipmentSerializer
    permission_classes = [IsAdminOrReadOnly]

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [BookingPermission]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Booking.objects.none()
        if user.roles.filter(role='admin').exists():
            return Booking.objects.all().order_by('-created_at')
        return Booking.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Ticket.objects.none()
        if user.roles.filter(role='admin').exists():
            return Ticket.objects.all().order_by('-purchased_at')
        return Ticket.objects.filter(user=user).order_by('-purchased_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [ChatMessagePermission]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ChatMessage.objects.none()
        if user.roles.filter(role='admin').exists():
            return ChatMessage.objects.all().order_by('created_at')
        return ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('created_at')

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver_id')
        receiver = None
        if receiver_id:
            try:
                receiver = User.objects.get(id=receiver_id)
            except (User.DoesNotExist, ValueError):
                pass
        serializer.save(sender=self.request.user, receiver=receiver)

class FooterSettingsViewSet(viewsets.ModelViewSet):
    queryset = FooterSettings.objects.all()
    serializer_class = FooterSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all().order_by('-created_at')
    serializer_class = PortfolioSerializer
    permission_classes = [IsAdminOrReadOnly]

class ContactSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ContactSubmission.objects.all().order_by('-created_at')
    serializer_class = ContactSubmissionSerializer
    permission_classes = [IsAdminOrInsertOnly]

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all().order_by('-created_at')
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminOrReadOnly]

class TrustedBrandViewSet(viewsets.ModelViewSet):
    queryset = TrustedBrand.objects.all().order_by('-created_at')
    serializer_class = TrustedBrandSerializer
    permission_classes = [IsAdminOrReadOnly]

class SiteStatisticViewSet(viewsets.ModelViewSet):
    queryset = SiteStatistic.objects.all()
    serializer_class = SiteStatisticSerializer
    permission_classes = [IsAdminOrReadOnly]

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.all()

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            return Profile.objects.get(user_id=pk)
        except (Profile.DoesNotExist, ValueError):
            try:
                return Profile.objects.get(id=pk)
            except (Profile.DoesNotExist, ValueError):
                from django.http import Http404
                raise Http404

class UserRoleViewSet(viewsets.ModelViewSet):
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return UserRole.objects.filter(user=user)

# Auth endpoints
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('full_name', '')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=email, email=email, password=password)
        Profile.objects.create(user=user, full_name=full_name)
        UserRole.objects.create(user=user, role='user')

        return Response({
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'roles': ['user']
            }
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'roles': [r.role for r in self.user.roles.all()]
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import os
        import uuid
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile

        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        ext = os.path.splitext(file_obj.name)[1]
        filename = f"{uuid.uuid4()}{ext}"

        # Save to 'uploads/filename' under MEDIA_ROOT
        path = default_storage.save(f"uploads/{filename}", ContentFile(file_obj.read()))
        url = f"/media/{path}"

        return Response({'url': url}, status=status.HTTP_201_CREATED)
