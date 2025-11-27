from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Avg, Max, Min, Q
from datetime import datetime, timedelta
from .models import WeeklyReport, MonthlyReport, YearlyReport
from .serializers import WeeklyReportSerializer, MonthlyReportSerializer, YearlyReportSerializer
from transactions.models import Transaction
from budgets.models import MonthlyBudget, WeeklyBudget


class WeeklyReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WeeklyReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['week_number', 'year']
    ordering_fields = ['year', 'week_number', 'created_at']
    ordering = ['-year', '-week_number']
    
    def get_queryset(self):
        return WeeklyReport.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        week_number = request.data.get('week_number')
        year = request.data.get('year')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        if not all([week_number, year, start_date, end_date]):
            return Response(
                {"detail": "week_number, year, start_date, and end_date are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        income = transactions.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0
        expenses = transactions.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
        savings = transactions.filter(transaction_type='savings').aggregate(total=Sum('amount'))['total'] or 0
        
        needs = transactions.filter(category='needs').aggregate(total=Sum('amount'))['total'] or 0
        wants = transactions.filter(category='wants').aggregate(total=Sum('amount'))['total'] or 0
        culture = transactions.filter(category='culture').aggregate(total=Sum('amount'))['total'] or 0
        unexpected = transactions.filter(category='unexpected').aggregate(total=Sum('amount'))['total'] or 0
        
        weekly_budget = WeeklyBudget.objects.filter(
            monthly_budget__user=request.user,
            week_number=week_number,
            start_date=start_date,
            end_date=end_date
        ).first()
        
        budget_adherence = 0
        if weekly_budget and weekly_budget.total_allocated > 0:
            budget_adherence = (expenses / weekly_budget.total_allocated) * 100
        
        savings_rate = (savings / income * 100) if income > 0 else 0
        
        report, created = WeeklyReport.objects.update_or_create(
            user=request.user,
            week_number=week_number,
            year=year,
            defaults={
                'start_date': start_date,
                'end_date': end_date,
                'total_income': income,
                'total_expenses': expenses,
                'total_savings': savings,
                'needs_spent': needs,
                'wants_spent': wants,
                'culture_spent': culture,
                'unexpected_spent': unexpected,
                'budget_adherence': budget_adherence,
                'savings_rate': savings_rate,
            }
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MonthlyReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MonthlyReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['month', 'year']
    ordering_fields = ['year', 'month', 'created_at']
    ordering = ['-year', '-month']
    
    def get_queryset(self):
        return MonthlyReport.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        month = request.data.get('month')
        year = request.data.get('year')
        
        if not month or not year:
            return Response(
                {"detail": "month and year are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__month=month,
            date__year=year
        )
        
        income = transactions.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0
        expenses = transactions.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
        savings = transactions.filter(transaction_type='savings').aggregate(total=Sum('amount'))['total'] or 0
        
        needs = transactions.filter(category='needs').aggregate(total=Sum('amount'))['total'] or 0
        wants = transactions.filter(category='wants').aggregate(total=Sum('amount'))['total'] or 0
        culture = transactions.filter(category='culture').aggregate(total=Sum('amount'))['total'] or 0
        unexpected = transactions.filter(category='unexpected').aggregate(total=Sum('amount'))['total'] or 0
        
        category_totals = {'needs': needs, 'wants': wants, 'culture': culture, 'unexpected': unexpected}
        top_category = max(category_totals, key=category_totals.get) if any(category_totals.values()) else ''
        
        from calendar import monthrange
        days_in_month = monthrange(year, month)[1]
        avg_daily = expenses / days_in_month if days_in_month > 0 else 0
        
        monthly_budget = MonthlyBudget.objects.filter(
            user=request.user,
            month=month,
            year=year
        ).first()
        
        budget_adherence = 0
        if monthly_budget and monthly_budget.total_allocated > 0:
            budget_adherence = (expenses / monthly_budget.total_allocated) * 100
        
        savings_rate = (savings / income * 100) if income > 0 else 0
        
        report, created = MonthlyReport.objects.update_or_create(
            user=request.user,
            month=month,
            year=year,
            defaults={
                'total_income': income,
                'total_expenses': expenses,
                'total_savings': savings,
                'needs_spent': needs,
                'wants_spent': wants,
                'culture_spent': culture,
                'unexpected_spent': unexpected,
                'budget_adherence': budget_adherence,
                'savings_rate': savings_rate,
                'top_expense_category': top_category,
                'average_daily_spending': avg_daily,
            }
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class YearlyReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = YearlyReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['year']
    ordering_fields = ['year', 'created_at']
    ordering = ['-year']
    
    def get_queryset(self):
        return YearlyReport.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        year = request.data.get('year')
        
        if not year:
            return Response(
                {"detail": "year is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__year=year
        )
        
        income = transactions.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0
        expenses = transactions.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
        savings = transactions.filter(transaction_type='savings').aggregate(total=Sum('amount'))['total'] or 0
        
        needs = transactions.filter(category='needs').aggregate(total=Sum('amount'))['total'] or 0
        wants = transactions.filter(category='wants').aggregate(total=Sum('amount'))['total'] or 0
        culture = transactions.filter(category='culture').aggregate(total=Sum('amount'))['total'] or 0
        unexpected = transactions.filter(category='unexpected').aggregate(total=Sum('amount'))['total'] or 0
        
        monthly_reports = MonthlyReport.objects.filter(user=request.user, year=year)
        
        best_month = None
        worst_month = None
        if monthly_reports.exists():
            best = monthly_reports.order_by('-savings_rate').first()
            worst = monthly_reports.order_by('savings_rate').first()
            best_month = best.month if best else None
            worst_month = worst.month if worst else None
        
        avg_monthly_income = income / 12
        avg_monthly_expenses = expenses / 12
        avg_monthly_savings = savings / 12
        
        total_budget = MonthlyBudget.objects.filter(
            user=request.user,
            year=year
        ).aggregate(total=Sum('needs_budget') + Sum('wants_budget') + Sum('culture_budget') + Sum('unexpected_budget'))['total'] or 0
        
        budget_adherence = (expenses / total_budget * 100) if total_budget > 0 else 0
        savings_rate = (savings / income * 100) if income > 0 else 0
        
        report, created = YearlyReport.objects.update_or_create(
            user=request.user,
            year=year,
            defaults={
                'total_income': income,
                'total_expenses': expenses,
                'total_savings': savings,
                'needs_spent': needs,
                'wants_spent': wants,
                'culture_spent': culture,
                'unexpected_spent': unexpected,
                'average_monthly_income': avg_monthly_income,
                'average_monthly_expenses': avg_monthly_expenses,
                'average_monthly_savings': avg_monthly_savings,
                'budget_adherence': budget_adherence,
                'savings_rate': savings_rate,
                'best_month': best_month,
                'worst_month': worst_month,
            }
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)