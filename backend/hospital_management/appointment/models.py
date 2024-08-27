from django.db import models
from patient.models import Pateint
from doctor.models import Doctor, AvailableTime
from hospital_management.constant import APPOINTMENT_STATUS, APPOINTMENT_TYPE
# Create your models here.


class Appointment(models.Model):
    patient = models.ForeignKey(to=Pateint, on_delete=models.CASCADE)
    doctor = models.ForeignKey(to=Doctor, on_delete=models.CASCADE)
    appointment_type = models.CharField(choices=APPOINTMENT_TYPE, max_length=50)
    appointment_status = models.CharField(choices=APPOINTMENT_STATUS, max_length=50, default='Pendding')
    symptoms = models.TextField()
    time = models.ForeignKey(AvailableTime, on_delete=models.CASCADE)
    cancel = models.BooleanField(default=False)
    
    def __str__(self) -> str:
        return f'{self.id}'