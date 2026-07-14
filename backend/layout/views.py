from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import HomepageLayout, SiteSetting, DailyVerse
from .serializers import HomepageLayoutSerializer, SiteSettingSerializer, DailyVerseSerializer
from users.permissions import IsEditor, IsAdmin
from django.utils import timezone

class PublicHomepageLayoutView(generics.ListAPIView):
    queryset = HomepageLayout.objects.filter(is_visible=True)
    serializer_class = HomepageLayoutSerializer
    permission_classes = (permissions.AllowAny,)

class PublicSiteSettingView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        setting = SiteSetting.objects.first()
        if not setting:
            # Return default setting parameters if not created yet
            return Response({
                'site_name': 'Isezerano',
                'primary_color': '#2F6DF6',
                'maintenance_mode': False,
                'footer_text': '© 2026 Isezerano. Futuristic Digital Journalism.'
            })
        serializer = SiteSettingSerializer(setting)
        return Response(serializer.data)

# ================= CMS API VIEWS =================

class CMSHomepageLayoutViewSet(viewsets.ModelViewSet):
    queryset = HomepageLayout.objects.all()
    serializer_class = HomepageLayoutSerializer
    permission_classes = (IsEditor,)

class CMSSiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer
    permission_classes = (IsAdmin,)

    def get_object(self):
        # Always operate on the singleton instance
        obj, created = SiteSetting.objects.get_or_create(id=1)
        return obj

class DailyVerseTodayView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        today = timezone.localdate()
        verse = DailyVerse.objects.filter(date=today).first()
        if not verse:
            # Fallback to the latest verse if none for today
            verse = DailyVerse.objects.order_by('-date').first()
            
        if not verse:
            return Response({
                'verse_reference': 'Habakuki 2:3',
                'verse_text_kinyarwanda': 'Kuko ibyo kwerekwa bifite igihe byabariwe...',
                'verse_text_english': 'For the revelation awaits an appointed time...'
            })
        serializer = DailyVerseSerializer(verse)
        return Response(serializer.data)

class CMSDailyVerseViewSet(viewsets.ModelViewSet):
    queryset = DailyVerse.objects.all()
    serializer_class = DailyVerseSerializer
    permission_classes = (IsEditor,)
