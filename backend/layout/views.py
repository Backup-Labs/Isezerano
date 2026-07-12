from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import HomepageLayout, SiteSetting
from .serializers import HomepageLayoutSerializer, SiteSettingSerializer
from users.permissions import IsEditor, IsAdmin

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
                'site_name': 'The Pulse',
                'primary_color': '#2F6DF6',
                'maintenance_mode': False,
                'footer_text': '© 2026 The Pulse. Futuristic Digital Journalism.'
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
