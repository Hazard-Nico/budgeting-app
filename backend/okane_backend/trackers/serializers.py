from rest_framework import serializers
from .models import SavingsTracker, DebtTracker, LoanTracker, SubscriptionTracker
from accounts.serializers import UserSerializer


class SavingsTrackerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    target_amount_formatted = serializers.SerializerMethodField()
    current_amount_formatted = serializers.SerializerMethodField()
    remaining_amount_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = SavingsTracker
        fields = [
            'id', 'user', 'goal_name',
            'target_amount', 'target_amount_formatted',
            'current_amount', 'current_amount_formatted',
            'progress_percentage',
            'remaining_amount', 'remaining_amount_formatted',
            'target_date', 'priority', 'notes',
            'is_completed', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_completed', 'completed_at', 'created_at', 'updated_at']
    
    def get_target_amount_formatted(self, obj):
        return f"Rp {obj.target_amount:,.0f}".replace(',', '.')
    
    def get_current_amount_formatted(self, obj):
        return f"Rp {obj.current_amount:,.0f}".replace(',', '.')
    
    def get_remaining_amount_formatted(self, obj):
        return f"Rp {obj.remaining_amount:,.0f}".replace(',', '.')
    
    def validate(self, data):
        if data.get('target_amount') and data['target_amount'] <= 0:
            raise serializers.ValidationError({"target_amount": "Target amount must be positive"})
        
        if data.get('current_amount') and data['current_amount'] < 0:
            raise serializers.ValidationError({"current_amount": "Current amount cannot be negative"})
        
        return data


class DebtTrackerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = DebtTracker
        fields = [
            'id', 'user', 'debt_name', 'creditor', 'original_amount',
            'remaining_amount', 'paid_amount', 'progress_percentage',
            'interest_rate', 'due_date', 'minimum_payment',
            'priority', 'notes', 'is_paid_off', 'paid_off_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_paid_off', 'paid_off_at', 'created_at', 'updated_at']
    
    def validate(self, data):
        if data.get('original_amount') and data['original_amount'] <= 0:
            raise serializers.ValidationError({"original_amount": "Original amount must be positive"})
        
        if data.get('paid_amount') and data['paid_amount'] < 0:
            raise serializers.ValidationError({"paid_amount": "Paid amount cannot be negative"})
        
        if data.get('interest_rate') and data['interest_rate'] < 0:
            raise serializers.ValidationError({"interest_rate": "Interest rate cannot be negative"})
        
        return data


class LoanTrackerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = LoanTracker
        fields = [
            'id', 'user', 'loan_name', 'lender', 'original_amount',
            'remaining_amount', 'paid_amount', 'progress_percentage',
            'interest_rate', 'monthly_payment', 'start_date', 'end_date',
            'priority', 'notes', 'is_paid_off', 'paid_off_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_paid_off', 'paid_off_at', 'created_at', 'updated_at']
    
    def validate(self, data):
        if data.get('original_amount') and data['original_amount'] <= 0:
            raise serializers.ValidationError({"original_amount": "Original amount must be positive"})
        
        if data.get('paid_amount') and data['paid_amount'] < 0:
            raise serializers.ValidationError({"paid_amount": "Paid amount cannot be negative"})
        
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({"end_date": "End date must be after start date"})
        
        return data


class SubscriptionTrackerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    days_until_renewal = serializers.IntegerField(read_only=True)
    annual_cost = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = SubscriptionTracker
        fields = [
            'id', 'user', 'service_name', 'cost', 'billing_cycle',
            'start_date', 'next_billing_date', 'days_until_renewal',
            'annual_cost', 'category', 'auto_renewal', 'payment_method',
            'notes', 'is_active', 'cancelled_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'cancelled_at', 'created_at', 'updated_at']
    
    def validate(self, data):
        if data.get('cost') and data['cost'] <= 0:
            raise serializers.ValidationError({"cost": "Cost must be positive"})
        
        if data.get('start_date') and data.get('next_billing_date'):
            if data['start_date'] > data['next_billing_date']:
                raise serializers.ValidationError({"next_billing_date": "Next billing date must be after start date"})
        
        return data


class SavingsTrackerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsTracker
        fields = [
            'goal_name', 'target_amount', 'current_amount',
            'target_date', 'priority', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DebtTrackerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebtTracker
        fields = [
            'debt_name', 'creditor', 'original_amount', 'paid_amount',
            'interest_rate', 'due_date', 'minimum_payment',
            'priority', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class LoanTrackerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanTracker
        fields = [
            'loan_name', 'lender', 'original_amount', 'paid_amount',
            'interest_rate', 'monthly_payment', 'start_date', 'end_date',
            'priority', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SubscriptionTrackerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionTracker
        fields = [
            'service_name', 'cost', 'billing_cycle',
            'start_date', 'next_billing_date', 'category',
            'auto_renewal', 'payment_method', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)