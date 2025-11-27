from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class User(AbstractUser):
    """Custom User model"""
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('id', 'Bahasa Indonesia'),
    ]
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    currency = models.CharField(max_length=3, default='IDR')
    is_setup_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.email


class AccountBalance(models.Model):
    """User's account balance"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='balance')
    current_balance = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_savings = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Account Balances"
    
    def __str__(self):
        return f"{self.user.email} - Balance: {self.current_balance}"


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    monthly_income_goal = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    monthly_savings_goal = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} Profile"