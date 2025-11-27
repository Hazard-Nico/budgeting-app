from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from .models import Transaction, Income, FixedExpense
from .serializers import TransactionSerializer, IncomeSerializer, FixedExpenseSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """Transaction CRUD operations"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'category', 'date']
    search_fields = ['description', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get transactions grouped by category"""
        queryset = self.get_queryset()
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Group by category
        categories = queryset.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary"""
        queryset = self.get_queryset()
        
        # Filter by month/year
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if month and year:
            queryset = queryset.filter(date__month=month, date__year=year)
        
        summary = {
            'total_income': queryset.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_expenses': queryset.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_savings': queryset.filter(transaction_type='saving').aggregate(Sum('amount'))['amount__sum'] or 0,
        }
        
        # Category breakdown
        summary['by_category'] = {
            'survival': queryset.filter(category='survival').aggregate(Sum('amount'))['amount__sum'] or 0,
            'optional': queryset.filter(category='optional').aggregate(Sum('amount'))['amount__sum'] or 0,
            'culture': queryset.filter(category='culture').aggregate(Sum('amount'))['amount__sum'] or 0,
            'extra': queryset.filter(category='extra').aggregate(Sum('amount'))['amount__sum'] or 0,
        }
        
        return Response(summary)


class IncomeViewSet(viewsets.ModelViewSet):
    """Income CRUD operations"""
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date', 'is_recurring']
    ordering_fields = ['date', 'amount']
    
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FixedExpenseViewSet(viewsets.ModelViewSet):
    """Fixed expense CRUD operations"""
    serializer_class = FixedExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['expense_type', 'is_active']
    ordering_fields = ['due_date', 'amount']
    
    def get_queryset(self):
        return FixedExpense.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming fixed expenses"""
        today = datetime.now().day
        queryset = self.get_queryset().filter(
            is_active=True,
            due_date__gte=today
        ).order_by('due_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)