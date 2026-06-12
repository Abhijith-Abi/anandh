from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from analytics.views import StudentTokenView, StudentProfileView

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT authentication endpoints (admin/teacher)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Student-specific auth endpoints
    path('api/student/token/', StudentTokenView.as_view(), name='student-token'),
    path('api/student/profile/', StudentProfileView.as_view(), name='student-profile'),
    # Application APIs
    path('api/', include('analytics.urls')),
]

