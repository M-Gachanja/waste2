from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class WasteType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    recyclable = models.BooleanField(default=False)
    co2_impact = models.FloatField(default=0, help_text="CO2 impact per kg")
    icon_name = models.CharField(max_length=30, blank=True)
    
    def __str__(self):
        return self.name

class WasteEntry(models.Model):
    UNIT_CHOICES = [
        ('g', 'Grams'),
        ('kg', 'Kilograms'),
        ('items', 'Items'),
        ('l', 'Liters'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    waste_type = models.ForeignKey(WasteType, on_delete=models.CASCADE)
    quantity = models.FloatField()
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    description = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.waste_type.name} - {self.quantity}"
    
    def converted_quantity_kg(self):
        if self.unit == 'g':
            return self.quantity / 1000
        elif self.unit == 'items':
            return self.quantity * 0.1  # Average 100g per item
        elif self.unit == 'l':
            return self.quantity  # Approximate 1:1 for water-based waste
        else:  # kg
            return self.quantity

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=100, blank=True)
    waste_reduction_goal = models.FloatField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()