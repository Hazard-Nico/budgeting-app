from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class MonthlyBudget(models.Model):
    """Monthly budget planning"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_budgets')
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Income
    planned_income = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_income = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Fixed Expenses
    planned_fixed_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_fixed_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Variable Expenses (Kakeibo Categories)
    planned_survival = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_survival = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    planned_optional = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_optional = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    planned_culture = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_culture = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    planned_extra = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_extra = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Savings
    planned_savings = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_savings = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'month', 'year']
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"{self.user.email} - {self.month}/{self.year}"


class WeeklyBudget(models.Model):
    """Weekly budget tracking"""
    monthly_budget = models.ForeignKey(MonthlyBudget, on_delete=models.CASCADE, related_name='weekly_budgets')
    week_number = models.IntegerField()  # 1-5
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Variable Expenses Budget
    planned_survival = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_survival = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    planned_optional = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_optional = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    planned_culture = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_culture = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    planned_extra = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    actual_extra = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['week_number']
    
    def __str__(self):
        return f"Week {self.week_number} - {self.monthly_budget}"