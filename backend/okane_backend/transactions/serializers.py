from rest_framework import serializers
from .models import Transaction, Income, FixedExpense


class TransactionSerializer(serializers.ModelSerializer):
    """Transaction serializer with validation"""
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def validate(self, attrs):
        # Validate category for expense transactions
        if attrs.get('transaction_type') == 'expense' and not attrs.get('category'):
            raise serializers.ValidationError({
                "category": "Category is required for expense transactions"
            })
        
        # Validate amount
        if attrs.get('amount') and attrs['amount'] <= 0:
            raise serializers.ValidationError({
                "amount": "Amount must be greater than 0"
            })
        
        return attrs


class IncomeSerializer(serializers.ModelSerializer):
    """Income serializer"""
    
    class Meta:
        model = Income
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class FixedExpenseSerializer(serializers.ModelSerializer):
    """Fixed expense serializer"""
    
    class Meta:
        model = FixedExpense
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def validate_due_date(self, value):
        if value < 1 or value > 31:
            raise serializers.ValidationError("Due date must be between 1 and 31")
        return value
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value