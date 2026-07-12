from rest_framework import serializers
from .models import AdSlot, AnalyticsEvent

class AdSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdSlot
        fields = ('id', 'name', 'placement', 'image', 'html_content', 'target_url', 'start_date', 'end_date', 'priority', 'impressions', 'clicks', 'is_active', 'ctr')
        read_only_fields = ('id', 'impressions', 'clicks', 'ctr')

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = ('id', 'event_type', 'article', 'ad_slot', 'ip_address', 'user_agent', 'referrer', 'created_at')
        read_only_fields = ('id', 'created_at')
