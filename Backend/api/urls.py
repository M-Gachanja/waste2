from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'waste-types', views.WasteTypeViewSet)
router.register(r'waste-entries', views.WasteEntryViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Authentication endpoints
    path('auth/register/', views.UserViewSet.as_view({'post': 'create'}), name='register'),
    path('auth/login/', views.login_view.as_view(), name='login'),
    path('auth/logout/', views.logout_view.as_view(), name='logout'),
    path('auth/current/', views.UserViewSet.as_view({'get': 'current'}), name='current-user'),
    # Analytics endpoint
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),
]