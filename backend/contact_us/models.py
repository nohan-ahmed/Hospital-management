from django.db import models


# Create your models here.
class ContactUs(models.Model):
    name = models.CharField(max_length=50)
    phone = models.CharField(max_length=11)
    massage = models.TextField()
    class Meta:
        verbose_name_plural = 'Contact Us'
    def __str__(self):
        return self.name

