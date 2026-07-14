from rest_framework import serializers
from .models import AdSlot, AnalyticsEvent

class AdSlotSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    sponsored_logo = serializers.SerializerMethodField()

    class Meta:
        model = AdSlot
        fields = (
            'id', 'name', 'placement', 'image', 'html_content', 'target_url', 
            'cta_text', 'sponsored_logo', 'sponsored_headline', 'sponsored_video_url',
            'start_date', 'end_date', 'priority', 'impressions', 'clicks', 'is_active', 'ctr'
        )
        read_only_fields = ('id', 'impressions', 'clicks', 'ctr')

    def get_image(self, obj):
        if not obj.image:
            return None
        name = obj.image.name
        if name.startswith('http://') or name.startswith('https://'):
            return name
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

    def get_sponsored_logo(self, obj):
        if not obj.sponsored_logo:
            return None
        name = obj.sponsored_logo.name
        if name.startswith('http://') or name.startswith('https://'):
            return name
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.sponsored_logo.url)
        return obj.sponsored_logo.url

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = ('id', 'event_type', 'article', 'ad_slot', 'ip_address', 'user_agent', 'referrer', 'created_at')
        read_only_fields = ('id', 'created_at')
