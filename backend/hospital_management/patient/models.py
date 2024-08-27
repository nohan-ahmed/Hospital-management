from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Pateint(models.Model):
    user = models.OneToOneField(to=User, on_delete=models.CASCADE, related_name='pateint')
    profile = models.ImageField(upload_to='patient/images')
    phone = models.CharField(max_length=12)
    
    def __str__(self) -> str:
        return f'{self.user.first_name} {self.user.last_name}'