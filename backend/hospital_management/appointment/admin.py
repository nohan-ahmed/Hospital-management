from django.contrib import admin
from .models import Appointment
# Register your models here.

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id','doctor', 'patient__user__username','appointment_type','appointment_status','time','cancel']
    
    def doctor(self, obj):
        return obj.doctor
    
    def doctor(self, obj):
        return obj.pateint
    
    def doctor(self, obj):
        return obj.time