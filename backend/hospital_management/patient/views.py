from django.shortcuts import render
from rest_framework import viewsets
from .models import Pateint
from .serializers import PateintSerializer
# Create your views here.

class PateintView(viewsets.ModelViewSet):
    queryset = Pateint.objects.all()
    serializer_class = PateintSerializer