from rest_framework import viewsets
from .models import MediaAsset
from .serializers import MediaAssetSerializer
from users.permissions import IsJournalist

class CMSMediaAssetViewSet(viewsets.ModelViewSet):
    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer
    permission_classes = (IsJournalist,)
