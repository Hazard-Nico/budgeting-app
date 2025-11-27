from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class SavingsTracker(models.Model):
    """Savings goals and tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)
    current_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    target_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"
    
    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return (self.current_amount / self.target_amount) * 100
        return 0


class DebtTracker(models.Model):
    """Debt tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts')
    creditor = models.CharField(max_length=100)
    original_amount = models.DecimalField(max_digits=15, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    monthly_payment = models.DecimalField(max_digits=15, decimal_places=2)
    due_date = models.DateField()
    description = models.TextField(blank=True)
    is_paid_off = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.creditor}"
    
    @property
    def progress_percentage(self):
        if self.original_amount > 0:
            paid = self.original_amount - self.remaining_amount
            return (paid / self.original_amount) * 100
        return 0


class LoanTracker(models.Model):
    """Loan tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    lender = models.CharField(max_length=100)
    original_amount = models.DecimalField(max_digits=15, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    monthly_payment = models.DecimalField(max_digits=15, decimal_places=2)
    due_date = models.DateField()
    description = models.TextField(blank=True)
    is_paid_off = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.lender}"


class SubscriptionTracker(models.Model):
    """Subscription tracking"""
    BILLING_CYCLE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES)
    next_billing_date = models.DateField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"