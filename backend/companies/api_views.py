from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Count
from .models import Company, Department
from accounts.models import User
from employees.models import Employee # For counting employees
from .serializers import (
    CompanySerializer,
    CompanyRegistrationSerializer,
    DepartmentSerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer
)


class CompanyRegistrationView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyRegistrationSerializer

    def perform_create(self, serializer):
        # The owner is the current authenticated user who is registering the company
        serializer.save(owner=self.request.user)

class CompanyDetailView(generics.RetrieveUpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Ensure users can only access their own company's details
        if self.request.user.is_parent:
            return Company.objects.filter(owner=self.request.user)
        elif self.request.user.is_admin or self.request.user.is_employee:
            return Company.objects.filter(id=self.request.user.company.id)
        return Company.objects.none()

    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            raise NotFound("Company not found or you don't have permission to access it.")

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Add counts for related objects
            instance.departments_count = Department.objects.filter(company=instance).count()
            instance.employees_count = Employee.objects.filter(company=instance).count()
            instance.admin_count = User.objects.filter(company=instance, role=User.UserRole.ADMIN).count()

            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        # Only allow parent users to update company details
        if not request.user.is_parent:
            raise PermissionDenied("Only company owners can update company details.")
        
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return Department.objects.filter(company__owner=user)
        elif user.is_admin:
            return Department.objects.filter(company=user.company)
        return Department.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_parent:
            company = Company.objects.get(owner=user)
        elif user.is_admin:
            company = user.company
        else:
            raise generics.exceptions.PermissionDenied("You do not have permission to add departments.")
        serializer.save(company=company)


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return Department.objects.filter(company__owner=user)
        elif user.is_admin:
            return Department.objects.filter(company=user.company)
        return Department.objects.none()


class AdminUserListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return User.objects.filter(company__owner=user, role=User.UserRole.ADMIN)
        return User.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_parent:
            company = Company.objects.get(owner=user)
            serializer.save(company=company) # Pass company to the serializer's create method
        else:
            raise generics.exceptions.PermissionDenied("Only company owners can create admin users.")


class AdminUserDetailView(generics.RetrieveDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return User.objects.filter(company__owner=user, role=User.UserRole.ADMIN)
        return User.objects.none()

    def perform_destroy(self, instance):
        if not self.request.user.is_parent or instance.role != User.UserRole.ADMIN:
            raise generics.exceptions.PermissionDenied("You do not have permission to delete this admin user.")
        instance.delete()