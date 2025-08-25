from django.contrib.auth.models import User
# DRF
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
# Local modules
from .models import Patient
from .serializers import PateintSerializer
from hospital_management.permissions import IsOwnerOrReadOnly
from hospital_management.paginations import StandardResultsSetPagination
# Create your views here.

class PateintView(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PateintSerializer
    permission_classes = [IsOwnerOrReadOnly]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'PateintView'
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ('phone',)
    search_fields = ('id', 'user', 'phone')
    pagination_class = StandardResultsSetPagination
    
    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request':request})
        if serializer.is_valid(raise_exception=True):
            pateint = serializer.save()
            return Response(pateint, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)

