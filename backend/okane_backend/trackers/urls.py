from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SavingsTrackerViewSet,
    DebtTrackerViewSet,
    LoanTrackerViewSet,
    SubscriptionTrackerViewSet
)

router = DefaultRouter()
router.register(r'savings', SavingsTrackerViewSet, basename='savings-tracker')
router.register(r'debts', DebtTrackerViewSet, basename='debt-tracker')
router.register(r'loans', LoanTrackerViewSet, basename='loan-tracker')
router.register(r'subscriptions', SubscriptionTrackerViewSet, basename='subscription-tracker')

urlpatterns = [
    path('', include(router.urls)),
]