from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Subscriber, NewsletterCampaign
from .serializers import SubscriberSerializer, NewsletterCampaignSerializer
from users.permissions import IsAdmin

class SubscribeView(generics.CreateAPIView):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        # Allow activating an existing inactive subscriber
        email = request.data.get('email')
        if email:
            subscriber, created = Subscriber.objects.get_or_create(email=email)
            if not created:
                subscriber.is_active = True
                subscriber.save()
            serializer = self.get_serializer(subscriber)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'email': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

# ================= CMS API VIEWS =================

class CMSSubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = (IsAdmin,)

class CMSNewsletterCampaignViewSet(viewsets.ModelViewSet):
    queryset = NewsletterCampaign.objects.all()
    serializer_class = NewsletterCampaignSerializer
    permission_classes = (IsAdmin,)

    @action(detail=True, methods=['post'])
    def send_campaign(self, request, pk=None):
        campaign = self.get_object()
        if campaign.status == 'sent':
            return Response({'detail': 'Campaign was already sent.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Simulate sending campaign
        campaign.status = 'sent'
        campaign.sent_at = timezone.now()
        campaign.save()

        # In production, Celery background tasks would send mail out
        return Response({'status': 'Campaign sending completed'}, status=status.HTTP_200_OK)
