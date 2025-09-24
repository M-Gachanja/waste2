from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import WasteType, WasteEntry, UserProfile
from .serializers import (UserSerializer, WasteTypeSerializer, 
                         WasteEntrySerializer, UserProfileSerializer)

class WasteTypeViewSet(viewsets.ModelViewSet):
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer

class WasteEntryViewSet(viewsets.ModelViewSet):
    serializer_class = WasteEntrySerializer
    
    def get_queryset(self):
        return WasteEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class AnalyticsViewSet(viewsets.ViewSet):
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