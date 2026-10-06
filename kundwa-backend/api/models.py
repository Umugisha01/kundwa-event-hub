from django.db import models
from django.contrib.auth.models import User
import uuid

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, default='')
    phone = models.CharField(max_length=50, blank=True, null=True)
    avatar_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.email

class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.CharField(max_length=50, default='user') # 'admin' or 'user'

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.email} - {self.role}"

class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField() # Start date & time
    end_date = models.DateTimeField(blank=True, null=True)
    door_time = models.CharField(max_length=100, blank=True, null=True, default="4:00 PM")
    status = models.CharField(max_length=50, default="Upcoming") # 'Upcoming', 'Active', 'Expired', 'Sold Out', 'Postponed'
    location = models.CharField(max_length=255, blank=True, null=True)
    venue = models.CharField(max_length=255, blank=True, null=True)
    organizer = models.CharField(max_length=255, blank=True, null=True, default="Rotary Club Kigali Virunga")
    category = models.CharField(max_length=100, default="Festival", blank=True, null=True)
    phone = models.CharField(max_length=100, default="+250 789 808 030", blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    ticket_price = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Starting / fallback price
    total_tickets = models.IntegerField(default=100)
    tickets_sold = models.IntegerField(default=0)
    ticket_tiers = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=255, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, default='Event Production')
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    gallery_images = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Audio')
    description = models.TextField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Available')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, blank=True, null=True)
    equipment = models.ForeignKey(Equipment, on_delete=models.SET_NULL, blank=True, null=True)
    booking_type = models.CharField(max_length=50, default='event') # 'event' or 'equipment'
    status = models.CharField(max_length=50, default='Pending') # 'Pending', 'Approved', 'Completed', 'Rejected'
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='tickets', blank=True, null=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    ticket_code = models.CharField(max_length=100, unique=True)
    ticket_type = models.CharField(max_length=100, default='Standard')
    tier_id = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_email = models.CharField(max_length=255, blank=True, null=True)
    customer_phone = models.CharField(max_length=100, blank=True, null=True)
    qr_code_data = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Active') # 'Active', 'Checked In', 'Cancelled'
    purchased_at = models.DateTimeField(auto_now_add=True)

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='received_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class FooterSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact_email = models.CharField(max_length=255, default='info@kundwaib.com')
    contact_phone = models.CharField(max_length=255, default='+250 788 000 000')
    contact_address = models.CharField(max_length=255, default='Kigali, Rwanda')
    tagline = models.TextField(default='Creating unforgettable experiences with world-class sound, lighting, and stage production.', blank=True, null=True)
    facebook_url = models.TextField(blank=True, null=True)
    instagram_url = models.TextField(blank=True, null=True)
    twitter_url = models.TextField(blank=True, null=True)
    youtube_url = models.TextField(blank=True, null=True)
    copyright_text = models.TextField(default='© Kundwa IB Group. All rights reserved.')
    quick_links = models.JSONField(default=list, blank=True)
    services_list = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Footer Settings ({self.contact_email})"

class HeroSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    headline_prefix = models.CharField(max_length=255, default="Creating")
    headline_highlight = models.CharField(max_length=255, default="Unforgettable")
    headline_suffix = models.CharField(max_length=255, default="Experiences")
    subtitle_prefix = models.CharField(max_length=255, default="with")
    subtitle_brand = models.CharField(max_length=255, default="Kundwa")
    glitch_words = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, null=True, default="Creating unforgettable experiences with world-class sound, lighting, and stage production.")
    background_image = models.TextField(default="/14.jpg")
    cta_buttons = models.JSONField(default=list, blank=True)
    carousel_photos = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hero Settings ({self.id})"

class Portfolio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.TextField()
    images = models.JSONField(default=list) # list of urls
    video_url = models.TextField(blank=True, null=True)
    date = models.CharField(max_length=100)
    client = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ContactSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=100)
    message = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client_name = models.CharField(max_length=255)
    message = models.TextField()
    image_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class TrustedBrand(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    logo_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SiteStatistic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    events_produced = models.IntegerField(default=500)
    attendees_served = models.IntegerField(default=100000)
    years_experience = models.IntegerField(default=10)
    countries_reached = models.IntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)
