from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import Announcement
from .serializers import AnnouncementSerializer
from users.permissions import IsEditor, IsAdmin
from django.utils import timezone

class PublicAnnouncementListView(generics.ListAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        # By default, only active announcements
        queryset = Announcement.objects.filter(is_active=True)
        
        # Support filtering by type: amasoko, akazi, ibyemezo_by_urukiko, guhindura_amazina
        announcement_type = self.request.query_params.get('type')
        if announcement_type:
            queryset = queryset.filter(announcement_type=announcement_type)
            
        # Support searching by query
        search_query = self.request.query_params.get('q')
        if search_query:
            queryset = queryset.filter(title__icontains=search_query) | queryset.filter(organization_name__icontains=search_query)

        return queryset

class PublicAnnouncementDetailView(generics.RetrieveAPIView):
    queryset = Announcement.objects.filter(is_active=True)
    serializer_class = AnnouncementSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = 'pk'

# ================= CMS API VIEWS =================

class CMSAnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = (IsEditor,)
