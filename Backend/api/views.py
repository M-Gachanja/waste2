from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import WasteType, WasteEntry, UserProfile
from .serializers import (UserSerializer, WasteTypeSerializer, 
                         WasteEntrySerializer, UserProfileSerializer)

class WasteTypeViewSet(viewsets.ModelViewSet):
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer
    permission_classes = [AllowAny]  # Public - anyone can view waste types

class WasteEntryViewSet(viewsets.ModelViewSet):
    queryset = WasteEntry.objects.all()  # This is required for basename
    serializer_class = WasteEntrySerializer
    permission_classes = [IsAuthenticated]  # Private - requires login
    
    def get_queryset(self):
        # Filter to only show entries for the current user
        return WasteEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Make public for testing

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]  # Private

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]  # Private
    
    def list(self, request):
        user = request.user
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
        entries = WasteEntry.objects.filter(
            user=user, 
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