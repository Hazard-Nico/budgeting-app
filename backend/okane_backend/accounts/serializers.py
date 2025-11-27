from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import AccountBalance, UserProfile

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'language', 'currency')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create related models
        AccountBalance.objects.create(user=user)
        UserProfile.objects.create(user=user)
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class AccountBalanceSerializer(serializers.ModelSerializer):
    """Account balance serializer"""
    class Meta:
        model = AccountBalance
        fields = '__all__'
        read_only_fields = ('user', 'updated_at')


class UserSerializer(serializers.ModelSerializer):
    """User serializer with profile and balance"""
    profile = UserProfileSerializer(read_only=True)
    balance = AccountBalanceSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'language', 'currency', 'is_setup_complete', 'profile', 'balance',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')