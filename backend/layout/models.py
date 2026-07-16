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
    )

    section_type = models.CharField(max_length=30, choices=SECTION_CHOICES)
    order = models.PositiveIntegerField(default=0)
    
    # Specific fields for conditional sections
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, help_text="Required for Category Scroll Rail sections")
    ad_slot = models.ForeignKey(AdSlot, on_delete=models.SET_NULL, null=True, blank=True, help_text="Required for Advertisement Banner Block sections")
    
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Homepage Layout Section"
        verbose_name_plural = "Homepage Layout Sections"

    def __str__(self):
        desc = self.get_section_type_display()
        if self.section_type == 'category-rail' and self.category:
            desc += f" ({self.category.name})"
        elif self.section_type == 'ad-slot' and self.ad_slot:
            desc += f" ({self.ad_slot.name})"
        return f"{self.order}. {desc}"

class SiteSetting(models.Model):
    site_name = models.CharField(max_length=100, default='Isezerano')
    logo_light = models.ImageField(upload_to='settings/', null=True, blank=True)
    logo_dark = models.ImageField(upload_to='settings/', null=True, blank=True)
    
    primary_color = models.CharField(max_length=7, default='#2F6DF6')
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

class DailyVerse(models.Model):
    date = models.DateField(unique=True, help_text="Date for which this verse is shown")
    verse_reference = models.CharField(max_length=255, help_text="e.g., Yohana 3:16 / John 3:16")
    verse_text_kinyarwanda = models.TextField(help_text="Verse text in Kinyarwanda")
    verse_text_english = models.TextField(help_text="Verse text in English")

    class Meta:
        ordering = ['-date']
        verbose_name = "Daily Verse"
        verbose_name_plural = "Daily Verses"

    def __str__(self):
        return f"{self.date} - {self.verse_reference}"
