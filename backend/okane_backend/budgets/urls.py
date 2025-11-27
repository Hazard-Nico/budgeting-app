from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MonthlyBudgetViewSet, WeeklyBudgetViewSet

router = DefaultRouter()
router.register(r'monthly', MonthlyBudgetViewSet, basename='monthly-budget')
router.register(r'weekly', WeeklyBudgetViewSet, basename='weekly-budget')

urlpatterns = [
    path('', include(router.urls)),
]