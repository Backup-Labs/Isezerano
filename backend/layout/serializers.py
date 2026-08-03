from rest_framework import serializers
from .models import HomepageLayout, SiteSetting, DailyVerse, SocialLink
from articles.serializers import CategorySerializer
from ads.serializers import AdSlotSerializer

class HomepageLayoutSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    ad_slot_details = AdSlotSerializer(source='ad_slot', read_only=True)

    class Meta:
        model = HomepageLayout
        fields = (
            'id', 'page', 'section_type', 'order', 'category', 'ad_slot', 
            'is_visible', 'article_limit', 'title', 'content', 
            'category_details', 'ad_slot_details'
        )

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = (
            'site_name', 'logo_light', 'logo_dark', 
            'primary_color', 'secondary_color', 'font_color', 'bg_color', 
            'btn_bg_color', 'btn_text_color', 'link_color', 'hover_color',
            'font_family_body', 'font_family_headings', 'active_theme', 'custom_css',
            'maintenance_mode', 'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url', 
            'footer_text', 'footer_recent_limit', 'homepage_limit'
        )

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ('id', 'platform', 'custom_name', 'url', 'icon_name', 'order')

class DailyVerseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyVerse
        fields = ('id', 'date', 'verse_reference', 'verse_text_kinyarwanda', 'verse_text_english', 'verse_text_french')
