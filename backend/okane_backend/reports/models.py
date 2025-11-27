from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class WeeklyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weekly_reports')
    week_number = models.IntegerField()
    year = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_savings = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    needs_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    wants_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    culture_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    unexpected_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    budget_adherence = models.FloatField(default=0)
    savings_rate = models.FloatField(default=0)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', '-week_number']
        unique_together = ['user', 'week_number', 'year']
        indexes = [
            models.Index(fields=['user', 'year', 'week_number']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Week {self.week_number} {self.year}"


class MonthlyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_reports')
    month = models.IntegerField()
    year = models.IntegerField()
    
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_savings = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    needs_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    wants_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    culture_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    unexpected_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    budget_adherence = models.FloatField(default=0)
    savings_rate = models.FloatField(default=0)
    
    top_expense_category = models.CharField(max_length=50, blank=True)
    average_daily_spending = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['user', 'month', 'year']
        indexes = [
            models.Index(fields=['user', 'year', 'month']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.month}/{self.year}"


class YearlyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='yearly_reports')
    year = models.IntegerField()
    
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_savings = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    needs_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    wants_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    culture_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    unexpected_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    average_monthly_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_monthly_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_monthly_savings = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    budget_adherence = models.FloatField(default=0)
    savings_rate = models.FloatField(default=0)
    
    best_month = models.IntegerField(null=True, blank=True)
    worst_month = models.IntegerField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year']
        unique_together = ['user', 'year']
        indexes = [
            models.Index(fields=['user', 'year']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.year}"