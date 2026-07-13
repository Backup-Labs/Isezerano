from django.db import models
from django.conf import settings
from articles.models import Article

class AdSlot(models.Model):
    PLACEMENT_CHOICES = (
        ('header-banner', 'Header Banner (970x250)'),
        ('sidebar-rail', 'Sidebar Rail (300x600)'),
        ('in-feed-native', 'In-Feed Native Ad Card'),
        ('in-article-inline', 'In-Article Inline (336x280)'),
        ('footer-banner', 'Footer Banner (728x90)'),
        ('interstitial', 'Interstitial Modal (Glass popup)'),
    )

    name = models.CharField(max_length=100)
    placement = models.CharField(max_length=30, choices=PLACEMENT_CHOICES)
    image = models.ImageField(upload_to='ads/', null=True, blank=True)
    html_content = models.TextField(blank=True, help_text="For custom HTML/JS ad codes like Google Adsense")
    target_url = models.URLField(blank=True)
    cta_text = models.CharField(max_length=50, default='Learn More')
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    priority = models.PositiveIntegerField(default=0, help_text="Higher priority ads are served first")
    
    impressions = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.get_placement_display()}"

    @property
    def ctr(self):
        if self.impressions == 0:
            return 0.0
        return round((self.clicks / self.impressions) * 100, 2)

class AnalyticsEvent(models.Model):
    EVENT_TYPE_CHOICES = (
        ('pageview', 'Page View'),
        ('ad_impression', 'Ad Impression'),
        ('ad_click', 'Ad Click'),
    )

    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    article = models.ForeignKey(Article, on_delete=models.SET_NULL, null=True, blank=True, related_name='analytics_events')
    ad_slot = models.ForeignKey(AdSlot, on_delete=models.SET_NULL, null=True, blank=True, related_name='analytics_events')
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    referrer = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_event_type_display()} at {self.created_at}"
