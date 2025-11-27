from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from .models import MonthlyBudget, WeeklyBudget
from .serializers import (
    MonthlyBudgetSerializer, WeeklyBudgetSerializer,
    MonthlyBudgetCreateSerializer, WeeklyBudgetCreateSerializer
)
from transactions.models import Transaction


class MonthlyBudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['month', 'year']
    ordering_fields = ['year', 'month', 'created_at']
    ordering = ['-year', '-month']
    search_fields = ['notes']
    
    def get_queryset(self):
        return MonthlyBudget.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MonthlyBudgetCreateSerializer
        return MonthlyBudgetSerializer
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        now = datetime.now()
        budget = MonthlyBudget.objects.filter(
            user=request.user,
            month=now.month,
            year=now.year
        ).first()
        
        if not budget:
            return Response(
                {"detail": "No budget found for current month"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(budget)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        budget = self.get_object()
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__month=budget.month,
            date__year=budget.year,
            transaction_type='expense'
        )
        
        category_spending = {
            'needs': transactions.filter(category='needs').aggregate(total=Sum('amount'))['total'] or 0,
            'wants': transactions.filter(category='wants').aggregate(total=Sum('amount'))['total'] or 0,
            'culture': transactions.filter(category='culture').aggregate(total=Sum('amount'))['total'] or 0,
            'unexpected': transactions.filter(category='unexpected').aggregate(total=Sum('amount'))['total'] or 0,
        }
        
        return Response({
            'budget': MonthlyBudgetSerializer(budget).data,
            'spending': category_spending,
            'total_spent': sum(category_spending.values()),
            'total_budget': budget.total_allocated,
            'remaining': budget.remaining
        })


class WeeklyBudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['monthly_budget', 'week_number']
    ordering_fields = ['week_number', 'start_date', 'created_at']
    ordering = ['week_number']
    
    def get_queryset(self):
        return WeeklyBudget.objects.filter(monthly_budget__user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WeeklyBudgetCreateSerializer
        return WeeklyBudgetSerializer
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        today = datetime.now().date()
        budget = WeeklyBudget.objects.filter(
            monthly_budget__user=request.user,
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if not budget:
            return Response(
                {"detail": "No budget found for current week"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(budget)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        budget = self.get_object()
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__gte=budget.start_date,
            date__lte=budget.end_date,
            transaction_type='expense'
        )
        
        category_spending = {
            'needs': transactions.filter(category='needs').aggregate(total=Sum('amount'))['total'] or 0,
            'wants': transactions.filter(category='wants').aggregate(total=Sum('amount'))['total'] or 0,
            'culture': transactions.filter(category='culture').aggregate(total=Sum('amount'))['total'] or 0,
            'unexpected': transactions.filter(category='unexpected').aggregate(total=Sum('amount'))['total'] or 0,
        }
        
        return Response({
            'budget': WeeklyBudgetSerializer(budget).data,
            'spending': category_spending,
            'total_spent': sum(category_spending.values()),
            'total_budget': budget.total_allocated,
            'remaining': budget.remaining
        })