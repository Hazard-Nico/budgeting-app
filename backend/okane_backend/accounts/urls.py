from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    UserDetailView,
    UserProfileView,
    AccountBalanceView,
    CompleteSetupView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('balance/', AccountBalanceView.as_view(), name='account-balance'),
    path('complete-setup/', CompleteSetupView.as_view(), name='complete-setup'),
]