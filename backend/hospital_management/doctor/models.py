from django.db import models
from django.contrib.auth.models import User
from patient.models import Patient
from hospital_management.constant import RATINGS
# Create your models here.
class Specialisation(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=60, unique=True)

    def __str__(self) -> str:
        return self.name

class Designation(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=60, unique=True)

    def __str__(self) -> str:
        return self.name

class AvailableTime(models.Model):
    time = models.CharField(max_length=50)

    def __str__(self) -> str:
        return self.time

class Doctor(models.Model):
    user = models.OneToOneField(to=User, on_delete=models.CASCADE, related_name="doctor")
    profile = models.ImageField(upload_to="doctor/images", null=True, blank=True)
    designation = models.ManyToManyField(to=Designation)
    specialisation = models.ManyToManyField(to=Specialisation)
    available_time = models.ManyToManyField(to=AvailableTime)
    fee = models.IntegerField()
    meet_link = models.CharField(max_length=250, null=True, blank=True)

    def __str__(self) -> str:
        return f"Dr. {self.user.first_name} {self.user.last_name}"

class Review(models.Model):
    reviwer = models.ForeignKey(to=Patient, on_delete=models.CASCADE, related_name='reviews')
    doctor = models.ForeignKey(to=Doctor, on_delete=models.CASCADE, related_name='reviews')
    body = models.TextField()
    created_on = models.DateField(auto_now_add=True)
    rating = models.CharField(choices=RATINGS, max_length=10)
    def __str__(self) -> str:
        return self.rating
