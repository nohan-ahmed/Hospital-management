from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile
from patient.models import Patient

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile for every new User"""
    if created:
        # Create a user profile for the new user
        profile = UserProfile.objects.create(user=instance)
        
        # Create a patient instance for the user if they don't already have one
        if not hasattr(instance, 'patient'):
            Patient.objects.create(user=instance)