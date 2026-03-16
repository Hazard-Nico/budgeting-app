from rest_framework import serializers
from .models import MonthlyBudget, WeeklyBudget
from accounts.serializers import UserSerializer


class MonthlyBudgetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_allocated = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)

    survival_budget_formatted = serializers.SerializerMethodField()
    optional_budget_formatted = serializers.SerializerMethodField()
    culture_budget_formatted = serializers.SerializerMethodField()
    extra_budget_formatted = serializers.SerializerMethodField()
    total_allocated_formatted = serializers.SerializerMethodField()
    total_spent_formatted = serializers.SerializerMethodField()
    remaining_formatted = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyBudget
        fields = [
            'id', 'user', 'month', 'year',
            'planned_income', 'actual_income',
            'planned_fixed_expenses', 'actual_fixed_expenses',
            'planned_survival', 'actual_survival', 'survival_budget_formatted',
            'planned_optional', 'actual_optional', 'optional_budget_formatted',
            'planned_culture', 'actual_culture', 'culture_budget_formatted',
            'planned_extra', 'actual_extra', 'extra_budget_formatted',
            'planned_savings', 'actual_savings',
            'total_allocated', 'total_allocated_formatted',
            'total_spent', 'total_spent_formatted',
            'remaining', 'remaining_formatted',
            'progress_percentage',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_survival_budget_formatted(self, obj):
        return f"Rp {obj.planned_survival:,.0f}".replace(',', '.')

    def get_optional_budget_formatted(self, obj):
        return f"Rp {obj.planned_optional:,.0f}".replace(',', '.')

    def get_culture_budget_formatted(self, obj):
        return f"Rp {obj.planned_culture:,.0f}".replace(',', '.')

    def get_extra_budget_formatted(self, obj):
        return f"Rp {obj.planned_extra:,.0f}".replace(',', '.')

    def get_total_allocated_formatted(self, obj):
        return f"Rp {obj.total_allocated:,.0f}".replace(',', '.')

    def get_total_spent_formatted(self, obj):
        return f"Rp {obj.total_spent:,.0f}".replace(',', '.')

    def get_remaining_formatted(self, obj):
        return f"Rp {obj.remaining:,.0f}".replace(',', '.')

    def validate(self, data):
        if data.get('month') and (data['month'] < 1 or data['month'] > 12):
            raise serializers.ValidationError({"month": "Month must be between 1 and 12"})
        if data.get('year') and data['year'] < 2000:
            raise serializers.ValidationError({"year": "Year must be 2000 or later"})
        return data


class WeeklyBudgetSerializer(serializers.ModelSerializer):
    monthly_budget = MonthlyBudgetSerializer(read_only=True)
    monthly_budget_id = serializers.PrimaryKeyRelatedField(
        queryset=MonthlyBudget.objects.all(),
        source='monthly_budget',
        write_only=True
    )
    total_allocated = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)

    survival_budget_formatted = serializers.SerializerMethodField()
    optional_budget_formatted = serializers.SerializerMethodField()
    culture_budget_formatted = serializers.SerializerMethodField()
    extra_budget_formatted = serializers.SerializerMethodField()
    total_allocated_formatted = serializers.SerializerMethodField()
    total_spent_formatted = serializers.SerializerMethodField()
    remaining_formatted = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyBudget
        fields = [
            'id', 'monthly_budget', 'monthly_budget_id', 'week_number',
            'start_date', 'end_date',
            'planned_survival', 'actual_survival', 'survival_budget_formatted',
            'planned_optional', 'actual_optional', 'optional_budget_formatted',
            'planned_culture', 'actual_culture', 'culture_budget_formatted',
            'planned_extra', 'actual_extra', 'extra_budget_formatted',
            'total_allocated', 'total_allocated_formatted',
            'total_spent', 'total_spent_formatted',
            'remaining', 'remaining_formatted',
            'progress_percentage',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_survival_budget_formatted(self, obj):
        return f"Rp {obj.planned_survival:,.0f}".replace(',', '.')

    def get_optional_budget_formatted(self, obj):
        return f"Rp {obj.planned_optional:,.0f}".replace(',', '.')

    def get_culture_budget_formatted(self, obj):
        return f"Rp {obj.planned_culture:,.0f}".replace(',', '.')

    def get_extra_budget_formatted(self, obj):
        return f"Rp {obj.planned_extra:,.0f}".replace(',', '.')

    def get_total_allocated_formatted(self, obj):
        return f"Rp {obj.total_allocated:,.0f}".replace(',', '.')

    def get_total_spent_formatted(self, obj):
        return f"Rp {obj.total_spent:,.0f}".replace(',', '.')

    def get_remaining_formatted(self, obj):
        return f"Rp {obj.remaining:,.0f}".replace(',', '.')

    def validate(self, data):
        if data.get('week_number') and (data['week_number'] < 1 or data['week_number'] > 5):
            raise serializers.ValidationError({"week_number": "Week number must be between 1 and 5"})
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({"end_date": "End date must be after start date"})
        return data


class MonthlyBudgetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBudget
        fields = [
            'month', 'year',
            'planned_income',
            'planned_fixed_expenses',
            'planned_survival', 'planned_optional', 'planned_culture', 'planned_extra',
            'planned_savings',
            'notes'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WeeklyBudgetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyBudget
        fields = [
            'monthly_budget', 'week_number', 'start_date', 'end_date',
            'planned_survival', 'planned_optional', 'planned_culture', 'planned_extra',
            'notes'
        ]