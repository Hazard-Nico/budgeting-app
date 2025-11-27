from rest_framework import serializers
from .models import WeeklyReport, MonthlyReport, YearlyReport
from accounts.serializers import UserSerializer


class WeeklyReportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = WeeklyReport
        fields = [
            'id', 'user', 'week_number', 'year', 'start_date', 'end_date',
            'total_income', 'total_expenses', 'total_savings', 'net_income',
            'needs_spent', 'wants_spent', 'culture_spent', 'unexpected_spent',
            'budget_adherence', 'savings_rate', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MonthlyReportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = MonthlyReport
        fields = [
            'id', 'user', 'month', 'year',
            'total_income', 'total_expenses', 'total_savings', 'net_income',
            'needs_spent', 'wants_spent', 'culture_spent', 'unexpected_spent',
            'budget_adherence', 'savings_rate',
            'top_expense_category', 'average_daily_spending', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class YearlyReportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = YearlyReport
        fields = [
            'id', 'user', 'year',
            'total_income', 'total_expenses', 'total_savings', 'net_income',
            'needs_spent', 'wants_spent', 'culture_spent', 'unexpected_spent',
            'average_monthly_income', 'average_monthly_expenses', 'average_monthly_savings',
            'budget_adherence', 'savings_rate',
            'best_month', 'worst_month', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']