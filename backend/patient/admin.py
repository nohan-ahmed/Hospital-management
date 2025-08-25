from django.contrib import admin
from .models import Patient


# Register your models here.
@admin.register(Patient)
class PateintAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "first_name", "last_name", "phone"]
    search_fields = ["id", "user", "phone"]
    list_filter = ["id", "user", "phone"]

    def first_name(self, object):
        return object.user.first_name

    def last_name(self, object):
        return object.user.last_name
