from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, UserRole, Event, MainService, Service, EquipmentCategory, Equipment, Booking, Ticket,
    ChatMessage, FooterSettings, HeroSettings, Portfolio, ContactSubmission,
    Testimonial, TrustedBrand, SiteStatistic
)

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['full_name', 'email', 'phone', 'avatar_url']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'roles']

    def get_roles(self, obj):
        return [r.role for r in obj.roles.all()]

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class MainServiceSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = MainService
        fields = '__all__'

    def get_items_count(self, obj):
        return Service.objects.filter(category=obj.title).count()

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class EquipmentCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = EquipmentCategory
        fields = '__all__'

    def get_items_count(self, obj):
        return Equipment.objects.filter(category=obj.name).count()

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    profiles = serializers.SerializerMethodField()
    events = serializers.SerializerMethodField()
    equipment = serializers.SerializerMethodField()
    equipment_id = serializers.UUIDField(required=False, allow_null=True, write_only=True)
    event_id = serializers.UUIDField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

    def create(self, validated_data):
        equipment_id = validated_data.pop('equipment_id', None)
        event_id = validated_data.pop('event_id', None)
        if equipment_id:
            from .models import Equipment
            eq = Equipment.objects.filter(id=equipment_id).first()
            if eq:
                validated_data['equipment'] = eq
                if not validated_data.get('equipment_name'):
                    validated_data['equipment_name'] = eq.name
        if event_id:
            from .models import Event
            ev = Event.objects.filter(id=event_id).first()
            if ev:
                validated_data['event'] = ev
        return super().create(validated_data)

    def get_profiles(self, obj):
        try:
            if obj.user:
                profile = getattr(obj.user, 'profile', None)
                if profile:
                    return {
                        'full_name': profile.full_name or obj.customer_name or obj.user.username,
                        'email': profile.user.email,
                        'phone': getattr(profile, 'phone', '') or obj.customer_phone or ''
                    }
                return {
                    'full_name': obj.customer_name or obj.user.username,
                    'email': obj.customer_email or obj.user.email,
                    'phone': obj.customer_phone or ''
                }
        except:
            pass
        return {
            'full_name': obj.customer_name or 'Valued Client',
            'email': obj.customer_email or 'N/A',
            'phone': obj.customer_phone or ''
        }

    def get_events(self, obj):
        if obj.event:
            return {'title': obj.event.title, 'ticket_price': float(obj.event.ticket_price)}
        return None

    def get_equipment(self, obj):
        if obj.equipment:
            return {
                'id': str(obj.equipment.id),
                'name': obj.equipment.name,
                'category': obj.equipment.category,
                'image_url': obj.equipment.image_url,
                'description': obj.equipment.description
            }
        if obj.equipment_name:
            return {
                'name': obj.equipment_name,
                'category': 'Equipment',
                'image_url': None
            }
        return None

class TicketSerializer(serializers.ModelSerializer):
    profiles = serializers.SerializerMethodField()
    events = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = '__all__'

    def get_profiles(self, obj):
        if obj.user:
            try:
                profile = obj.user.profile
                return {
                    'full_name': profile.full_name or obj.customer_name or obj.user.username,
                    'email': profile.user.email or obj.customer_email or '',
                    'phone': profile.phone or obj.customer_phone or ''
                }
            except:
                return {
                    'full_name': obj.customer_name or obj.user.username,
                    'email': obj.customer_email or obj.user.email,
                    'phone': obj.customer_phone or ''
                }
        return {
            'full_name': obj.customer_name or "Guest Attendee",
            'email': obj.customer_email or "N/A",
            'phone': obj.customer_phone or "N/A"
        }

    def get_events(self, obj):
        if obj.event:
            return {
                'id': str(obj.event.id),
                'title': obj.event.title,
                'date': obj.event.date.isoformat() if obj.event.date else None,
                'end_date': obj.event.end_date.isoformat() if obj.event.end_date else None,
                'location': obj.event.location,
                'venue': obj.event.venue,
                'door_time': obj.event.door_time,
                'organizer': obj.event.organizer,
                'image_url': obj.event.image_url,
            }
        return None

class ChatMessageSerializer(serializers.ModelSerializer):
    profiles = serializers.SerializerMethodField()
    sender_id = serializers.SerializerMethodField()
    receiver_id = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender_id', 'receiver_id', 'message', 'is_read', 'created_at', 'profiles']

    def get_sender_id(self, obj):
        return str(obj.sender.id) if obj.sender else None

    def get_receiver_id(self, obj):
        return str(obj.receiver.id) if obj.receiver else None

    def get_profiles(self, obj):
        try:
            profile = obj.sender.profile
            return {'full_name': profile.full_name, 'email': profile.sender.email}
        except:
            return {'full_name': obj.sender.username, 'email': obj.sender.email}

class FooterSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSettings
        fields = '__all__'

class HeroSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSettings
        fields = '__all__'

class PortfolioSerializer(serializers.ModelSerializer):
    images = serializers.JSONField(required=False, default=list)
    video_url = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    client = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Portfolio
        fields = '__all__'

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class TrustedBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedBrand
        fields = '__all__'

class SiteStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteStatistic
        fields = '__all__'
