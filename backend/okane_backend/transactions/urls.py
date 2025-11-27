from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, IncomeViewSet, FixedExpenseViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'fixed-expenses', FixedExpenseViewSet, basename='fixed-expense')

urlpatterns = [
    path('', include(router.urls)),
]