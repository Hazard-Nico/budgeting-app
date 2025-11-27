from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeeklyReportViewSet, MonthlyReportViewSet, YearlyReportViewSet

router = DefaultRouter()
router.register(r'weekly', WeeklyReportViewSet, basename='weekly-report')
router.register(r'monthly', MonthlyReportViewSet, basename='monthly-report')
router.register(r'yearly', YearlyReportViewSet, basename='yearly-report')

urlpatterns = [
    path('', include(router.urls)),
]