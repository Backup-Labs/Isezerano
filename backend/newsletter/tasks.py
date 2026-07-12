from celery import shared_task
from django.utils import timezone

@shared_task
def send_newsletter_campaign_task(campaign_id):
    # Move model imports inside the task function to prevent premature app registry checks
    from .models import Subscriber, NewsletterCampaign

    try:
        campaign = NewsletterCampaign.objects.get(id=campaign_id)
    except NewsletterCampaign.DoesNotExist:
        return f"Campaign {campaign_id} not found."

    if campaign.status == 'sent':
        return f"Campaign {campaign_id} has already been sent."

    campaign.status = 'sending'
    campaign.save()

    active_subscribers = Subscriber.objects.filter(is_active=True)
    emails = [sub.email for sub in active_subscribers]
    
    # Simulate work
    import time
    time.sleep(2)  # simulate sending delay

    campaign.status = 'sent'
    campaign.sent_at = timezone.now()
    campaign.save()

    return f"Campaign '{campaign.subject}' successfully transmitted to {len(emails)} terminals."
