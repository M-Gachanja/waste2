from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'waste-types', views.WasteTypeViewSet)
router.register(r'waste-entries', views.WasteEntryViewSet, basename='wasteentry')
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet, basename='userprofile')

urlpatterns = [
    path('', include(router.urls)),
    # JWT Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/current/', views.current_user_view, name='current-user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Analytics endpoint
    path('analytics/', views.analytics_view, name='analytics'),
]