from django.urls import path
# from . import views # Removed as template views are no longer used
from . import api_views, views
from django.contrib.auth import views as auth_views

app_name = 'accounts'

urlpatterns = [
    # Removed template-based authentication URLs
    path('login/', views.login_view, name='account_login'),
    path('register/', views.register_view, name='account_signup'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('logout/', auth_views.LogoutView.as_view(next_page='accounts:account_login'), name='account_logout'),

    # Removed template-based password change URLs
    path('password_change/', auth_views.PasswordChangeView.as_view(template_name='accounts/password_change_form.html'), name='account_change_password'),
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='accounts/password_change_done.html'), name='password_change_done'),

    # Removed template-based email change URL
    path('change-email/', views.email_change_view, name='account_email'),

    # API endpoints
    path('api/register/', api_views.RegisterView.as_view(), name='api_register'),
    path('api/login/', api_views.LoginView.as_view(), name='api_login'),
    path('api/logout/', api_views.LogoutView.as_view(), name='api_logout'),
    path('api/user/', api_views.UserDetailView.as_view(), name='api_user_detail'),

    # Test API endpoint
    path('test/', api_views.TestView.as_view(), name='test_view'),
] 