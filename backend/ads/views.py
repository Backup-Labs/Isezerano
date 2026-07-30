from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import F
from .models import AdSlot, AnalyticsEvent
from .serializers import AdSlotSerializer, AnalyticsEventSerializer
from users.permissions import IsAdmin, IsEditor
from newsletter.tasks import send_ad_kit_request


class ActiveAdView(APIView):
    permission_classes = (permissions.AllowAny,)

    # Legacy hyphenated placements → current underscore names
    PLACEMENT_ALIASES = {
        'header-banner': 'header_banner',
        'header_banner': 'header_banner',
        'sidebar-rail': 'sidebar-rail',
        'footer-banner': 'footer-banner',
        'in-feed-native': 'in-feed-native',
        'in-article-inline': 'in-article-inline',
    }

    def get(self, request, placement):
        now = timezone.now()
        resolved = self.PLACEMENT_ALIASES.get(placement, placement)
        # Also try both hyphen and underscore forms for flexibility
        candidates = {resolved, placement}
        if '-' in placement:
            candidates.add(placement.replace('-', '_'))
        if '_' in placement:
            candidates.add(placement.replace('_', '-'))

        ads = AdSlot.objects.filter(
            placement__in=candidates,
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).order_by('-priority')

        if not ads.exists():
            return Response({'detail': 'No active ads found.'}, status=status.HTTP_404_NOT_FOUND)

        # Serve the highest priority campaign
        ad = ads.first()
        serializer = AdSlotSerializer(ad, context={'request': request})
        return Response(serializer.data)


class RequestAdKitView(APIView):
    """Public endpoint: send ad kit inquiry + acknowledgement via SMTP."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        name = (request.data.get('name') or '').strip()
        email = (request.data.get('email') or '').strip()
        company = (request.data.get('company') or '').strip()
        phone = (request.data.get('phone') or '').strip()
        message = (request.data.get('message') or '').strip()

        if not name or not email:
            return Response(
                {'detail': 'Name and email are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            send_ad_kit_request(
                name=name,
                email=email,
                company=company,
                phone=phone,
                message=message,
            )
        except Exception as exc:
            return Response(
                {'detail': f'Failed to send email: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {'status': 'Ad kit request sent successfully.'},
            status=status.HTTP_200_OK,
        )


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
