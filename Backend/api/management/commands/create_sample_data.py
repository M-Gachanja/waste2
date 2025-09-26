# Save this as: Backend/api/management/commands/create_sample_data.py
# First create the directories: mkdir -p Backend/api/management/commands/

import os
from django.core.management.base import BaseCommand
from api.models import WasteType

class Command(BaseCommand):
    help = 'Create sample waste types for testing'

    def handle(self, *args, **options):
        waste_types = [
            {
                'name': 'Plastic',
                'description': 'Plastic bottles, containers, packaging',
                'recyclable': True,
                'co2_impact': 2.5,
                'icon_name': 'plastic'
            },
            {
                'name': 'Paper',
                'description': 'Newspapers, magazines, cardboard',
                'recyclable': True,
                'co2_impact': 1.2,
                'icon_name': 'paper'
            },
            {
                'name': 'Glass',
                'description': 'Bottles, jars, containers',
                'recyclable': True,
                'co2_impact': 0.8,
                'icon_name': 'glass'
            },
            {
                'name': 'Metal',
                'description': 'Cans, aluminum foil, metal containers',
                'recyclable': True,
                'co2_impact': 3.2,
                'icon_name': 'metal'
            },
            {
                'name': 'Organic',
                'description': 'Food scraps, yard waste',
                'recyclable': False,
                'co2_impact': 0.5,
                'icon_name': 'organic'
            },
            {
                'name': 'Electronic',
                'description': 'Old phones, computers, electronics',
                'recyclable': True,
                'co2_impact': 5.0,
                'icon_name': 'electronic'
            },
            {
                'name': 'General Waste',
                'description': 'Non-recyclable household waste',
                'recyclable': False,
                'co2_impact': 1.8,
                'icon_name': 'general'
            }
        ]

        for waste_type_data in waste_types:
            waste_type, created = WasteType.objects.get_or_create(
                name=waste_type_data['name'],
                defaults=waste_type_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created waste type: {waste_type.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Waste type already exists: {waste_type.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Sample waste types creation completed!')
        )