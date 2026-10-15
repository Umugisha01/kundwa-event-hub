from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.db.models import Q
from .models import (
    Profile, UserRole, Event, MainService, Service, EquipmentCategory, Equipment, Booking, Ticket,
    ChatMessage, FooterSettings, HeroSettings, Portfolio, ContactSubmission,
    Testimonial, TrustedBrand, SiteStatistic
)
from .serializers import (
    ProfileSerializer, UserRoleSerializer,
    EventSerializer, MainServiceSerializer, ServiceSerializer, EquipmentCategorySerializer, EquipmentSerializer,
    BookingSerializer, TicketSerializer, ChatMessageSerializer,
    FooterSettingsSerializer, HeroSettingsSerializer, PortfolioSerializer, ContactSubmissionSerializer,
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
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.roles.filter(role='admin').exists():
            return True
        return obj.user == request.user

class TicketPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
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

class MainServiceViewSet(viewsets.ModelViewSet):
    queryset = MainService.objects.all().order_by('order', 'title')
    serializer_class = MainServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_update(self, serializer):
        instance = serializer.instance
        old_title = instance.title
        updated_instance = serializer.save()
        if old_title != updated_instance.title:
            # Sync category name across sub-services
            Service.objects.filter(category=old_title).update(category=updated_instance.title)

    def perform_destroy(self, instance):
        # Delete child sub-services when main service package is deleted
        Service.objects.filter(category=instance.title).delete()
        instance.delete()

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Service.objects.all().order_by('name')
        slug = self.request.query_params.get('slug')
        category = self.request.query_params.get('category')
        if slug is not None:
            queryset = queryset.filter(slug=slug)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset

class EquipmentCategoryViewSet(viewsets.ModelViewSet):
    queryset = EquipmentCategory.objects.all().order_by('order', 'name')
    serializer_class = EquipmentCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_update(self, serializer):
        instance = serializer.instance
        old_name = instance.name
        updated_instance = serializer.save()
        if old_name != updated_instance.name:
            Equipment.objects.filter(category=old_name).update(category=updated_instance.name)

    def perform_destroy(self, instance):
        Equipment.objects.filter(category=instance.name).update(category='Other')
        instance.delete()

class EquipmentViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Equipment.objects.all().order_by('name')
        category = self.request.query_params.get('category')
        status_param = self.request.query_params.get('status')
        if category and category != 'All':
            queryset = queryset.filter(category=category)
        if status_param and status_param != 'All':
            queryset = queryset.filter(status=status_param)
        return queryset

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
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]

    def get_queryset(self):
        user = self.request.user
        event_id = self.request.query_params.get('event_id')

        if not user.is_authenticated:
            ticket_code = self.request.query_params.get('ticket_code')
            if ticket_code:
                return Ticket.objects.filter(ticket_code=ticket_code)
            return Ticket.objects.none()

        if user.roles.filter(role='admin').exists():
            qs = Ticket.objects.all().order_by('-purchased_at')
        else:
            qs = Ticket.objects.filter(user=user).order_by('-purchased_at')

        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        
        ticket_code = serializer.validated_data.get('ticket_code')
        if not ticket_code:
            import uuid
            ticket_code = f"KIB-{uuid.uuid4().hex[:8].upper()}"
            
        ticket = serializer.save(user=user, ticket_code=ticket_code)
        
        # Update event tickets_sold and tier sold count
        event = ticket.event
        if event:
            qty = ticket.quantity or 1
            event.tickets_sold = (event.tickets_sold or 0) + qty
            
            # If ticket tier was selected, update tier sold count in JSON
            if ticket.tier_id and isinstance(event.ticket_tiers, list):
                updated_tiers = []
                for tier in event.ticket_tiers:
                    if str(tier.get('id')) == str(ticket.tier_id) or tier.get('name') == ticket.ticket_type:
                        tier['sold'] = (tier.get('sold') or 0) + qty
                    updated_tiers.append(tier)
                event.ticket_tiers = updated_tiers
                
            event.save()

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

class HeroSettingsViewSet(viewsets.ModelViewSet):
    queryset = HeroSettings.objects.all()
    serializer_class = HeroSettingsSerializer
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

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "status": "ok",
            "service": "kundwa-backend",
            "version": "1.0.0"
        }, status=status.HTTP_200_OK)

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

class MoMoInitiatePaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .paypack import initiate_momo_cashin, format_rwanda_phone

        amount = request.data.get('amount')
        phone = request.data.get('phone')

        if not amount or not phone:
            return Response(
                {'error': 'Amount and phone number are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount_val = int(amount)
            if amount_val <= 0:
                raise ValueError("Amount must be positive.")
        except Exception:
            return Response(
                {'error': 'Invalid amount value.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        res = initiate_momo_cashin(
            amount=amount_val,
            phone=phone,
            metadata=request.data
        )

        return Response(res, status=status.HTTP_200_OK if res.get('success') else status.HTTP_400_BAD_REQUEST)

class MoMoPaymentStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, ref):
        from .paypack import check_momo_status
        res = check_momo_status(ref)
        return Response(res, status=status.HTTP_200_OK)

class MoMoApproveSimulationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, ref):
        from .paypack import approve_momo_simulation
        res = approve_momo_simulation(ref)
        return Response(res, status=status.HTTP_200_OK)

