from rest_framework import serializers
from .models import HomepageLayout, SiteSetting
from articles.serializers import CategorySerializer
from ads.serializers import AdSlotSerializer

class HomepageLayoutSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    ad_slot_details = AdSlotSerializer(source='ad_slot', read_only=True)

    class Meta:
        model = HomepageLayout
        fields = ('id', 'section_type', 'order', 'category', 'ad_slot', 'is_visible', 'category_details', 'ad_slot_details')

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ('site_name', 'logo_light', 'logo_dark', 'primary_color', 'maintenance_mode', 'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url', 'footer_text')
