from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Count
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
from .models import WasteType, WasteEntry, UserProfile
from .serializers import (UserSerializer, WasteTypeSerializer, 
                         WasteEntrySerializer, UserProfileSerializer)


class WasteTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for WasteType model"""
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer
    permission_classes = [AllowAny]


class WasteEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for WasteEntry model"""
    queryset = WasteEntry.objects.all()
    serializer_class = WasteEntrySerializer
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    
    def get_queryset(self):
        # If user is authenticated, filter by user, otherwise return all
        if self.request.user.is_authenticated:
            return WasteEntry.objects.filter(user=self.request.user)
        return WasteEntry.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # For testing - you might want to create a default user or handle differently
            serializer.save()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for UserProfile model"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]


class AnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for analytics - no model, so we need basename"""
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    
    def list(self, request):
        # Check if user is authenticated for personalized analytics
        if request.user.is_authenticated:
            user = request.user
        else:
            # For testing - return sample data or all data
            user = None
            
        time_period = request.query_params.get('period', 'week')
        
        # Calculate date range
        end_date = timezone.now().date()
        if time_period == 'week':
            start_date = end_date - timedelta(days=7)
        elif time_period == 'month':
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=7)
        
        # Get waste entries for the period
        if user:
            entries = WasteEntry.objects.filter(
                user=user, 
                date__range=[start_date, end_date]
            )
        else:
            # For testing - return all entries in period
            entries = WasteEntry.objects.filter(
                date__range=[start_date, end_date]
            )
        
        # Calculate statistics
        total_waste = sum(entry.converted_quantity_kg() for entry in entries)
        waste_by_type = entries.values('waste_type__name').annotate(
            total=Sum('quantity'),
            count=Count('id')
        )
        
        # Calculate environmental impact
        co2_saved = sum(
            entry.converted_quantity_kg() * entry.waste_type.co2_impact 
            for entry in entries if entry.waste_type.recyclable
        )
        
        data = {
            'period': time_period,
            'start_date': start_date,
            'end_date': end_date,
            'total_waste_kg': total_waste,
            'total_entries': entries.count(),
            'waste_by_type': list(waste_by_type),
            'co2_saved_kg': co2_saved,
        }
        
        return Response(data)


# Authentication views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({
            'error': 'Username already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(
            username=username,
            email=email or '',
            password=password
        )
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response({
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)