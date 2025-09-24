from django.contrib import admin
from .models import WasteType, WasteEntry, UserProfile

@admin.register(WasteType)
class WasteTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'recyclable', 'co2_impact']
    list_filter = ['recyclable']

@admin.register(WasteEntry)
class WasteEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'waste_type', 'quantity', 'unit', 'date']
    list_filter = ['waste_type', 'date']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'waste_reduction_goal']