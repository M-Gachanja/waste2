from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Count
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
from .models import WasteType, WasteEntry, UserProfile
from .serializers import (UserSerializer, WasteTypeSerializer, 
                         WasteEntrySerializer, UserProfileSerializer)

# ViewSets for CRUD operations
class WasteTypeViewSet(viewsets.ModelViewSet):
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer
    permission_classes = [AllowAny]

class WasteEntryViewSet(viewsets.ModelViewSet):
    serializer_class = WasteEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WasteEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically set the user to the current authenticated user
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Remove user from request data if it exists to avoid validation errors
        data = request.data.copy()
        if 'user' in data:
            data.pop('user')
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

# Authentication views
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
    else:
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not username or not password or not email:
        return Response({'error': 'Username, password, and email are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current authenticated user info"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_view(request):
    user = request.user
    time_period = request.query_params.get('period', 'week')
    
    end_date = timezone.now().date()
    if time_period == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_period == 'month':
        start_date = end_date - timedelta(days=30)
    else:
        start_date = end_date - timedelta(days=7)
    
    entries = WasteEntry.objects.filter(
        user=user, 
        date__range=[start_date, end_date]
    )
    
    total_waste = sum(entry.converted_quantity_kg() for entry in entries)
    waste_by_type = entries.values('waste_type__name').annotate(
        total=Sum('quantity'),
        count=Count('id')
    )
    
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