from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, UserRole, Event, Service, Equipment, Booking, Ticket,
    ChatMessage, FooterSettings, Portfolio, ContactSubmission,
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

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    profiles = serializers.SerializerMethodField()
    events = serializers.SerializerMethodField()
    equipment = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'

    def get_profiles(self, obj):
        try:
            profile = obj.user.profile
            return {'full_name': profile.full_name, 'email': profile.user.email}
        except:
            return {'full_name': obj.user.username, 'email': obj.user.email}

    def get_events(self, obj):
        if obj.event:
            return {'title': obj.event.title, 'ticket_price': float(obj.event.ticket_price)}
        return None

    def get_equipment(self, obj):
        if obj.equipment:
            return {'name': obj.equipment.name}
        return None

class TicketSerializer(serializers.ModelSerializer):
    profiles = serializers.SerializerMethodField()
    events = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = '__all__'

    def get_profiles(self, obj):
        try:
            profile = obj.user.profile
            return {'full_name': profile.full_name, 'email': profile.user.email}
        except:
            return {'full_name': obj.user.username, 'email': obj.user.email}

    def get_events(self, obj):
        if obj.event:
            return {
                'title': obj.event.title,
                'date': obj.event.date.isoformat() if obj.event.date else None,
                'location': obj.event.location
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

class PortfolioSerializer(serializers.ModelSerializer):
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
