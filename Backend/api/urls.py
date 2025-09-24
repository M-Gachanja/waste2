from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'waste-types', views.WasteTypeViewSet)
router.register(r'waste-entries', views.WasteEntryViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'analytics', views.AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
    # Add authentication endpoints
    path('auth/register/', views.UserViewSet.as_view({'post': 'create'}), name='register'),
    path('auth/login/', views.AnalyticsViewSet.as_view({'post': 'login'}), name='login'),
    path('auth/logout/', views.AnalyticsViewSet.as_view({'post': 'logout'}), name='logout'),
    path('auth/current/', views.UserViewSet.as_view({'get': 'current'}), name='current-user'),
]