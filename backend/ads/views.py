from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import F
from .models import AdSlot, AnalyticsEvent
from .serializers import AdSlotSerializer, AnalyticsEventSerializer
from users.permissions import IsAdmin, IsEditor

class ActiveAdView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, placement):
        now = timezone.now()
        # Find active campaigns for the given placement
        ads = AdSlot.objects.filter(
            placement=placement,
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).order_by('-priority')

        if not ads.exists():
            return Response({'detail': 'No active ads found.'}, status=status.HTTP_404_NOT_FOUND)

        # Serve the highest priority campaign
        ad = ads.first()
        serializer = AdSlotSerializer(ad)
        return Response(serializer.data)

class TrackAnalyticsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = AnalyticsEventSerializer(data=request.data)
        if serializer.is_valid():
            # Get IP and client agent details
            ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            referrer = request.META.get('HTTP_REFERER', '')

            event = serializer.save(
                ip_address=ip_address,
                user_agent=user_agent,
                referrer=referrer
            )

            # Accumulate totals in the AdSlot if it's an ad event
            if event.ad_slot:
                if event.event_type == 'ad_impression':
                    AdSlot.objects.filter(id=event.ad_slot.id).update(impressions=F('impressions') + 1)
                elif event.event_type == 'ad_click':
                    AdSlot.objects.filter(id=event.ad_slot.id).update(clicks=F('clicks') + 1)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ================= CMS API VIEWS =================

class CMSAdSlotViewSet(viewsets.ModelViewSet):
    queryset = AdSlot.objects.all()
    serializer_class = AdSlotSerializer
    permission_classes = (IsEditor,)
