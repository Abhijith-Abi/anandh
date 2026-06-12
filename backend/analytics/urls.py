from django.urls import path, include
from rest_framework.routers import DefaultRouter
from analytics.views import (
    StudentViewSet, PredictAPIView, DashboardAPIView, 
    UserProfileView, ForgotPasswordView, ExportCSVView, ExportPDFView
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('predict/', PredictAPIView.as_view(), name='predict'),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('reports/csv/', ExportCSVView.as_view(), name='export-csv'),
    path('reports/pdf/', ExportPDFView.as_view(), name='export-pdf'),
]
