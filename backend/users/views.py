from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserMeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .permissions import IsAdmin
from .models import UserAuditLog
from .serializers import CMSUserSerializer, CMSUserCreateSerializer, UserAuditLogSerializer
from rest_framework.decorators import action

class CMSUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = (IsAdmin,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return CMSUserCreateSerializer
        return CMSUserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        UserAuditLog.objects.create(
            actor=self.request.user,
            target_user=user,
            action='create',
            details=f"Created user {user.username} with role {user.role}"
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_role = old_instance.role
        old_active = old_instance.is_active
        
        # Save updates
        user = serializer.save()
        
        details_parts = []
        if old_role != user.role:
            details_parts.append(f"Changed role from {old_role} to {user.role}")
            # Align is_staff status based on role on update
            if user.role in ['admin', 'editor', 'journalist']:
                user.is_staff = True
            else:
                user.is_staff = False
            user.save()
        if old_active != user.is_active:
            status_str = "activated" if user.is_active else "deactivated"
            details_parts.append(f"Account {status_str}")
            
        other_changes = []
        for field in ['username', 'email', 'first_name', 'last_name', 'bio', 'twitter', 'github', 'website']:
            if getattr(old_instance, field) != getattr(user, field):
                other_changes.append(field)
        if other_changes:
            details_parts.append(f"Updated fields: {', '.join(other_changes)}")
            
        action_type = 'update'
        if old_role != user.role:
            action_type = 'role_change'
        elif old_active != user.is_active:
            action_type = 'status_change'
            
        details_str = "; ".join(details_parts) if details_parts else "Updated profile details"
        
        UserAuditLog.objects.create(
            actor=self.request.user,
            target_user=user,
            action=action_type,
            details=details_str
        )

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        if not password:
            return Response({"password": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(password)
        user.save()
        
        UserAuditLog.objects.create(
            actor=request.user,
            target_user=user,
            action='password_reset',
            details="Reset user password"
        )
        return Response({"status": "Password reset successfully"}, status=status.HTTP_200_OK)


class UserAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserAuditLog.objects.all()
    serializer_class = UserAuditLogSerializer
    permission_classes = (IsAdmin,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['target_user__username', 'target_user__email', 'actor__username', 'action', 'details']
    filterset_fields = ['action']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

