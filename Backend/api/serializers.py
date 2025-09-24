from rest_framework import serializers
from django.contrib.auth.models import User
from .models import WasteType, WasteEntry, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class WasteTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteType
        fields = '__all__'

class WasteEntrySerializer(serializers.ModelSerializer):
    waste_type_name = serializers.CharField(source='waste_type.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = WasteEntry
        fields = ['id', 'user', 'user_username', 'waste_type', 'waste_type_name', 
                 'quantity', 'unit', 'description', 'date', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'