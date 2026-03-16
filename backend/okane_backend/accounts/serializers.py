from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AccountBalance, UserProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'language', 'currency', 'is_setup_complete',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AccountBalanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    current_balance_formatted = serializers.SerializerMethodField()
    total_income_formatted = serializers.SerializerMethodField()
    total_expenses_formatted = serializers.SerializerMethodField()
    total_savings_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = AccountBalance
        fields = [
            'id', 'user', 'current_balance', 'current_balance_formatted',
            'total_income', 'total_income_formatted',
            'total_expenses', 'total_expenses_formatted',
            'total_savings', 'total_savings_formatted',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'updated_at']
    
    def get_current_balance_formatted(self, obj):
        return f"Rp {obj.current_balance:,.0f}".replace(',', '.')
    
    def get_total_income_formatted(self, obj):
        return f"Rp {obj.total_income:,.0f}".replace(',', '.')
    
    def get_total_expenses_formatted(self, obj):
        return f"Rp {obj.total_expenses:,.0f}".replace(',', '.')
    
    def get_total_savings_formatted(self, obj):
        return f"Rp {obj.total_savings:,.0f}".replace(',', '.')


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    monthly_income_goal_formatted = serializers.SerializerMethodField()
    monthly_savings_goal_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'avatar', 'bio',
            'monthly_income_goal', 'monthly_income_goal_formatted',
            'monthly_savings_goal', 'monthly_savings_goal_formatted',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_monthly_income_goal_formatted(self, obj):
        return f"Rp {obj.monthly_income_goal:,.0f}".replace(',', '.')
    
    def get_monthly_savings_goal_formatted(self, obj):
        return f"Rp {obj.monthly_savings_goal:,.0f}".replace(',', '.')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    language = serializers.CharField(max_length=5, default='en')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                  'first_name', 'last_name', 'phone', 'language', 'currency']
    
    def validate_language(self, value):
        allowed = ['en', 'id', 'ja']
        if value not in allowed:
            raise serializers.ValidationError(f"Language must be one of: {', '.join(allowed)}")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user