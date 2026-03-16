from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import date

User = get_user_model()


class SavingsTracker(models.Model):
    PRIORITY_CHOICES = [(1, 'Low'), (2, 'Medium'), (3, 'High')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings')
    goal_name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    current_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    target_date = models.DateField(null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', 'target_date']

    def __str__(self):
        return f"{self.user.email} - {self.goal_name}"

    @property
    def remaining_amount(self):
        remaining = self.target_amount - self.current_amount
        return remaining if remaining > Decimal('0.00') else Decimal('0.00')

    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return float((self.current_amount / self.target_amount) * 100)
        return 0.0


class DebtTracker(models.Model):
    PRIORITY_CHOICES = [(1, 'Low'), (2, 'Medium'), (3, 'High')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts')
    debt_name = models.CharField(max_length=100)
    creditor = models.CharField(max_length=100)
    original_amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    due_date = models.DateField()
    minimum_payment = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    notes = models.TextField(blank=True)
    is_paid_off = models.BooleanField(default=False)
    paid_off_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', 'due_date']

    def __str__(self):
        return f"{self.user.email} - {self.debt_name}"

    @property
    def remaining_amount(self):
        remaining = self.original_amount - self.paid_amount
        return remaining if remaining > Decimal('0.00') else Decimal('0.00')

    @property
    def progress_percentage(self):
        if self.original_amount > 0:
            return float((self.paid_amount / self.original_amount) * 100)
        return 0.0


class LoanTracker(models.Model):
    PRIORITY_CHOICES = [(1, 'Low'), (2, 'Medium'), (3, 'High')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    loan_name = models.CharField(max_length=100)
    lender = models.CharField(max_length=100)
    original_amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    monthly_payment = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    notes = models.TextField(blank=True)
    is_paid_off = models.BooleanField(default=False)
    paid_off_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', 'end_date']

    def __str__(self):
        return f"{self.user.email} - {self.loan_name}"

    @property
    def remaining_amount(self):
        remaining = self.original_amount - self.paid_amount
        return remaining if remaining > Decimal('0.00') else Decimal('0.00')

    @property
    def progress_percentage(self):
        if self.original_amount > 0:
            return float((self.paid_amount / self.original_amount) * 100)
        return 0.0


class SubscriptionTracker(models.Model):
    BILLING_CYCLE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    CATEGORY_CHOICES = [
        ('entertainment', 'Entertainment'),
        ('productivity', 'Productivity'),
        ('health', 'Health & Fitness'),
        ('education', 'Education'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    service_name = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES)
    start_date = models.DateField(null=True, blank=True)
    next_billing_date = models.DateField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    auto_renewal = models.BooleanField(default=True)
    payment_method = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_billing_date']

    def __str__(self):
        return f"{self.user.email} - {self.service_name}"

    @property
    def days_until_renewal(self):
        delta = self.next_billing_date - date.today()
        return delta.days

    @property
    def annual_cost(self):
        multipliers = {
            'daily': Decimal('365'),
            'weekly': Decimal('52'),
            'monthly': Decimal('12'),
            'quarterly': Decimal('4'),
            'yearly': Decimal('1'),
        }
        return self.cost * multipliers.get(self.billing_cycle, Decimal('1'))