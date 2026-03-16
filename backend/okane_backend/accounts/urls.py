from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserDetailView,
    UserProfileView,
    AccountBalanceView,
    CompleteSetupView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('balance/', AccountBalanceView.as_view(), name='account-balance'),
    path('complete-setup/', CompleteSetupView.as_view(), name='complete-setup'),
]