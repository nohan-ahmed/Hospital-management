from django.contrib import admin
from . import models

# Register your models here.


@admin.register(models.Specialisation)
class SpecialisationAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


@admin.register(models.Designation)
class DesignationAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


@admin.register(models.Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "first_name", "last_name"]

    def first_name(self, obj):
        return obj.user.first_name

    def last_name(self, obj):
        return obj.user.last_name


admin.site.register(models.AvailableTime)
@admin.register(models.Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'reviwer', 'doctor', 'rating']
    def doctor(self, obj):
        return obj.doctor
    
    def reviwer(self, obj):
        return obj.reviwer