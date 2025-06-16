from django.urls import path
# from . import views # Removed as template views are no longer used
from . import api_views

app_name = 'employees'

urlpatterns = [
    # API endpoints for employees
    path('api/employees/', api_views.EmployeeListCreateView.as_view(), name='employee_list_create'),
    path('api/employees/<uuid:id>/', api_views.EmployeeDetailView.as_view(), name='employee_detail'),

    # Removed template-based URLs
    # path('', views.employee_list, name='employee_list'),
    # path('add/', views.add_employee, name='add_employee'),
    # path('<uuid:employee_id>/edit/', views.edit_employee, name='edit_employee'),
    # path('<uuid:employee_id>/delete/', views.delete_employee, name='delete_employee'),
    # path('dashboard/', views.employee_dashboard, name='employee_dashboard'),
]

