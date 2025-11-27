from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from .models import SavingsTracker, DebtTracker, LoanTracker, SubscriptionTracker
from .serializers import (
    SavingsTrackerSerializer, DebtTrackerSerializer,
    LoanTrackerSerializer, SubscriptionTrackerSerializer,
    SavingsTrackerCreateSerializer, DebtTrackerCreateSerializer,
    LoanTrackerCreateSerializer, SubscriptionTrackerCreateSerializer
)


class SavingsTrackerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['priority', 'is_completed']
    ordering_fields = ['target_date', 'target_amount', 'progress_percentage', 'created_at']
    ordering = ['-priority', 'target_date']
    search_fields = ['goal_name', 'notes']
    
    def get_queryset(self):
        return SavingsTracker.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SavingsTrackerCreateSerializer
        return SavingsTrackerSerializer
    
    @action(detail=True, methods=['post'])
    def add_amount(self, request, pk=None):
        tracker = self.get_object()
        amount = request.data.get('amount')
        
        if not amount or float(amount) <= 0:
            return Response(
                {"detail": "Amount must be positive"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tracker.current_amount += float(amount)
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        trackers = self.get_queryset()
        
        total_target = trackers.aggregate(total=Sum('target_amount'))['total'] or 0
        total_saved = trackers.aggregate(total=Sum('current_amount'))['total'] or 0
        completed = trackers.filter(is_completed=True).count()
        active = trackers.filter(is_completed=False).count()
        
        return Response({
            'total_target': total_target,
            'total_saved': total_saved,
            'total_remaining': total_target - total_saved,
            'completed_goals': completed,
            'active_goals': active,
            'overall_progress': (total_saved / total_target * 100) if total_target > 0 else 0
        })


class DebtTrackerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['priority', 'is_paid_off']
    ordering_fields = ['due_date', 'remaining_amount', 'interest_rate', 'created_at']
    ordering = ['-priority', 'due_date']
    search_fields = ['debt_name', 'creditor', 'notes']
    
    def get_queryset(self):
        return DebtTracker.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DebtTrackerCreateSerializer
        return DebtTrackerSerializer
    
    @action(detail=True, methods=['post'])
    def make_payment(self, request, pk=None):
        tracker = self.get_object()
        amount = request.data.get('amount')
        
        if not amount or float(amount) <= 0:
            return Response(
                {"detail": "Amount must be positive"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tracker.paid_amount += float(amount)
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        trackers = self.get_queryset()
        
        total_original = trackers.aggregate(total=Sum('original_amount'))['total'] or 0
        total_paid = trackers.aggregate(total=Sum('paid_amount'))['total'] or 0
        total_remaining = trackers.aggregate(total=Sum('remaining_amount'))['total'] or 0
        paid_off = trackers.filter(is_paid_off=True).count()
        active = trackers.filter(is_paid_off=False).count()
        
        return Response({
            'total_original': total_original,
            'total_paid': total_paid,
            'total_remaining': total_remaining,
            'paid_off_debts': paid_off,
            'active_debts': active,
            'overall_progress': (total_paid / total_original * 100) if total_original > 0 else 0
        })


class LoanTrackerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['priority', 'is_paid_off']
    ordering_fields = ['end_date', 'remaining_amount', 'interest_rate', 'created_at']
    ordering = ['-priority', 'end_date']
    search_fields = ['loan_name', 'lender', 'notes']
    
    def get_queryset(self):
        return LoanTracker.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LoanTrackerCreateSerializer
        return LoanTrackerSerializer
    
    @action(detail=True, methods=['post'])
    def make_payment(self, request, pk=None):
        tracker = self.get_object()
        amount = request.data.get('amount')
        
        if not amount or float(amount) <= 0:
            return Response(
                {"detail": "Amount must be positive"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tracker.paid_amount += float(amount)
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        trackers = self.get_queryset()
        
        total_original = trackers.aggregate(total=Sum('original_amount'))['total'] or 0
        total_paid = trackers.aggregate(total=Sum('paid_amount'))['total'] or 0
        total_remaining = trackers.aggregate(total=Sum('remaining_amount'))['total'] or 0
        paid_off = trackers.filter(is_paid_off=True).count()
        active = trackers.filter(is_paid_off=False).count()
        
        return Response({
            'total_original': total_original,
            'total_paid': total_paid,
            'total_remaining': total_remaining,
            'paid_off_loans': paid_off,
            'active_loans': active,
            'overall_progress': (total_paid / total_original * 100) if total_original > 0 else 0
        })


class SubscriptionTrackerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['billing_cycle', 'category', 'is_active', 'auto_renewal']
    ordering_fields = ['next_billing_date', 'cost', 'created_at']
    ordering = ['next_billing_date']
    search_fields = ['service_name', 'category', 'notes']
    
    def get_queryset(self):
        return SubscriptionTracker.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SubscriptionTrackerCreateSerializer
        return SubscriptionTrackerSerializer
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        tracker = self.get_object()
        tracker.is_active = False
        tracker.cancelled_at = datetime.now()
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        tracker = self.get_object()
        tracker.is_active = True
        tracker.cancelled_at = None
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        trackers = self.get_queryset().filter(is_active=True)
        
        monthly_cost = sum([
            t.cost if t.billing_cycle == 'monthly' else
            t.cost / 12 if t.billing_cycle == 'yearly' else
            t.cost * 52 / 12 if t.billing_cycle == 'weekly' else 0
            for t in trackers
        ])
        
        yearly_cost = sum([t.annual_cost for t in trackers])
        
        return Response({
            'total_subscriptions': trackers.count(),
            'monthly_cost': monthly_cost,
            'yearly_cost': yearly_cost,
            'by_category': {
                category: trackers.filter(category=category).count()
                for category in ['entertainment', 'productivity', 'health', 'education', 'other']
            }
        })
    
    @action(detail=False, methods=['get'])
    def upcoming_renewals(self, request):
        days = int(request.query_params.get('days', 7))
        today = datetime.now().date()
        end_date = today + timedelta(days=days)
        
        trackers = self.get_queryset().filter(
            is_active=True,
            next_billing_date__gte=today,
            next_billing_date__lte=end_date
        ).order_by('next_billing_date')
        
        serializer = self.get_serializer(trackers, many=True)
        return Response(serializer.data)