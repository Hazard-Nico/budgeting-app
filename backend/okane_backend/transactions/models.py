from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class Transaction(models.Model):
    """Base transaction model"""
    TRANSACTION_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('saving', 'Saving'),
    ]
    
    # Kakeibo Variable Expense Categories
    CATEGORY_CHOICES = [
        ('survival', 'Survival (Needs)'),
        ('optional', 'Optional (Wants)'),
        ('culture', 'Culture (Personal Development)'),
        ('extra', 'Extra (Unexpected)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True, null=True)
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    date = models.DateField()
    shopping_group = models.CharField(max_length=100, blank=True)
    is_recurring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'transaction_type']),
            models.Index(fields=['user', 'category']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.transaction_type} - {self.amount}"


class Income(models.Model):
    """Income tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=100)
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.TextField(blank=True)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.email} - {self.source} - {self.amount}"


class FixedExpense(models.Model):
    """Fixed expenses (rent, utilities, etc.)"""
    EXPENSE_TYPE_CHOICES = [
        ('basic', 'Basic Fixed Expense'),
        ('subscription', 'Subscription'),
        ('debt', 'Debt Payment'),
        ('loan', 'Loan Payment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fixed_expenses')
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPE_CHOICES)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.TextField(blank=True)
    due_date = models.IntegerField(help_text="Day of month (1-31)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date']
    
    def __str__(self):
        return f"{self.user.email} - {self.name} - {self.amount}"