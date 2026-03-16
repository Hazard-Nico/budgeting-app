from rest_framework import serializers
from .models import Transaction, Income, FixedExpense
from accounts.serializers import UserSerializer


class TransactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    amount_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'transaction_type', 'category',
            'amount', 'amount_formatted', 'description', 'date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_amount_formatted(self, obj):
        return f"Rp {obj.amount:,.0f}".replace(',', '.')
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


class IncomeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    amount_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Income
        fields = [
            'id', 'user', 'source', 'amount', 'amount_formatted',
            'frequency', 'date', 'notes', 'is_recurring',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_amount_formatted(self, obj):
        return f"Rp {obj.amount:,.0f}".replace(',', '.')


class FixedExpenseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    amount_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = FixedExpense
        fields = [
            'id', 'user', 'name', 'amount', 'amount_formatted',
            'frequency', 'due_date', 'category', 'notes', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_amount_formatted(self, obj):
        return f"Rp {obj.amount:,.0f}".replace(',', '.')


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'transaction_type', 'category',
            'amount', 'description', 'date', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class IncomeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['source', 'amount', 'frequency', 'date', 'notes', 'is_recurring']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FixedExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedExpense
        fields = ['name', 'amount', 'frequency', 'due_date', 'category', 'notes', 'is_active']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)