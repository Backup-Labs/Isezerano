from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'bio', 'twitter', 'github', 'website')
        read_only_fields = ('id', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='reader'  # Default newly registered users to reader
        )
        return user


from .models import UserAuditLog

class CMSUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'bio', 'twitter', 'github', 'website', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def validate_email(self, value):
        if value:
            qs = User.objects.filter(email__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

class CMSUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'is_active', 'avatar', 'bio', 'twitter', 'github', 'website')

    def validate_email(self, value):
        if value:
            if User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        # Automatically align django staff status based on role
        if user.role in ['admin', 'editor', 'journalist']:
            user.is_staff = True
        user.save()
        return user

class UserAuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    target_username = serializers.CharField(source='target_user.username', read_only=True)

    class Meta:
        model = UserAuditLog
        fields = ('id', 'actor', 'actor_username', 'target_user', 'target_username', 'action', 'details', 'timestamp')

