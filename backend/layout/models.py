from django.db import models
from django.core.exceptions import ValidationError
from articles.models import Category
from ads.models import AdSlot

class HomepageLayout(models.Model):
    SECTION_CHOICES = (
        ('hero', 'Hero Lead Story Section'),
        ('featured-grid', 'Secondary Featured Grid (3-4 stories)'),
        ('category-rail', 'Category Scroll Rail'),
        ('ad-slot', 'Advertisement Banner Block'),
        ('trending-widget', 'Trending & Popular List Sidebar'),
        ('news-desk', 'News Desk Section'),
        ('announcements', 'Amatangazo Classifieds Section'),
        ('lifestyle', 'Lifestyle & Culture Section'),
        ('sports-grid', 'Sports Vertical Grid Section'),
        ('featured-secondary', 'Second Featured Posts Row'),
        ('flyers', 'Local Partner Flyers Row'),
        ('you-missed', 'You Missed Scroll Rail'),
        ('rich-text', 'Custom Rich Text Block'),
        ('contact-form', 'Contact Inquiry Form'),
    )

    page = models.CharField(max_length=50, default='home', db_index=True)
    section_type = models.CharField(max_length=30, choices=SECTION_CHOICES)
    order = models.PositiveIntegerField(default=0)
    article_limit = models.PositiveIntegerField(default=5, help_text="Number of articles to fetch for this section")
    
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True, help_text="HTML/markdown content for text sections")
    
    # Specific fields for conditional sections
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, help_text="Required for Category Scroll Rail sections")
    ad_slot = models.ForeignKey(AdSlot, on_delete=models.SET_NULL, null=True, blank=True, help_text="Required for Advertisement Banner Block sections")
    
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Page Section"
        verbose_name_plural = "Page Sections"

    def __str__(self):
        desc = self.get_section_type_display()
        if self.section_type == 'category-rail' and self.category:
            desc += f" ({self.category.name})"
        elif self.section_type == 'ad-slot' and self.ad_slot:
            desc += f" ({self.ad_slot.name})"
        return f"{self.page} - {self.order}. {desc}"

class SiteSetting(models.Model):
    site_name = models.CharField(max_length=100, default='Isezerano')
    logo_light = models.ImageField(upload_to='settings/', null=True, blank=True)
    logo_dark = models.ImageField(upload_to='settings/', null=True, blank=True)
    
    # Color overrides
    primary_color = models.CharField(max_length=7, default='#2F6DF6')
    secondary_color = models.CharField(max_length=7, default='#F0F4FF')
    font_color = models.CharField(max_length=7, default='#0F1117')
    bg_color = models.CharField(max_length=7, default='#FFFFFF')
    btn_bg_color = models.CharField(max_length=7, default='#062360')
    btn_text_color = models.CharField(max_length=7, default='#FFFFFF')
    link_color = models.CharField(max_length=7, default='#062360')
    hover_color = models.CharField(max_length=7, default='#0A3490')

    # Typography
    font_family_body = models.CharField(max_length=100, default='Inter')
    font_family_headings = models.CharField(max_length=100, default='Playfair Display')

    # Theme
    active_theme = models.CharField(max_length=50, default='theme-classic')
    custom_css = models.TextField(blank=True, default='')

    maintenance_mode = models.BooleanField(default=False)
    
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    
    footer_text = models.TextField(blank=True, default="© 2026 Isezerano. Futuristic Digital Journalism.")
    footer_recent_limit = models.PositiveIntegerField(default=3)
    homepage_limit = models.PositiveIntegerField(default=5)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def save(self, *args, **kwargs):
        if not self.pk and SiteSetting.objects.exists():
            raise ValidationError("There can only be one SiteSetting instance.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.site_name} Settings"

class SocialLink(models.Model):
    PLATFORM_CHOICES = (
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('twitter', 'Twitter/X'),
        ('youtube', 'YouTube'),
        ('tiktok', 'TikTok'),
        ('linkedin', 'LinkedIn'),
        ('custom', 'Custom Platform'),
    )
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='custom')
    custom_name = models.CharField(max_length=50, blank=True, help_text="Required for custom platform")
    url = models.URLField()
    icon_name = models.CharField(max_length=30, default='link', help_text="Lucide icon name (e.g. facebook, twitter, instagram, link)")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        if self.platform == 'custom':
            return f"{self.custom_name}: {self.url}"
        return f"{self.platform}: {self.url}"

class DailyVerse(models.Model):
    date = models.DateField(unique=True, help_text="Date for which this verse is shown")
    verse_reference = models.CharField(max_length=255, help_text="e.g., Yohana 3:16 / John 3:16")
    verse_text_kinyarwanda = models.TextField(help_text="Verse text in Kinyarwanda")
    verse_text_english = models.TextField(help_text="Verse text in English")
    verse_text_french = models.TextField(blank=True, default='', help_text="Verse text in French")

    class Meta:
        ordering = ['-date']
        verbose_name = "Daily Verse"
        verbose_name_plural = "Daily Verses"

    def __str__(self):
        return f"{self.date} - {self.verse_reference}"
