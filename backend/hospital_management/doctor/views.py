from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from . import serializers
from .models import Doctor, AvailableTime, Designation, Specialisation, Review
from rest_framework.throttling import UserRateThrottle
from hospital_management.permissions import IsOwnerOrReadOnly, IsAdminUserOrReadOnly
from hospital_management.paginations import StandardResultsSetPagination
# Create your views here.

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = serializers.DoctorSerializer
    permission_classes = [IsOwnerOrReadOnly]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    filterset_fields = ['specialisation', 'designation', 'specialisation', 'fee', 'available_time']

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            if Doctor.objects.filter(user=request.user).exists():
                return Response({'error':'You already have a doctor account'}, status=status.HTTP_400_BAD_REQUEST)
            
            doctor = serializer.save(user=request.user)
            return Response(doctor, status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_400_BAD_REQUEST)

class AvailableTimeViewSet(viewsets.ModelViewSet):
    queryset = AvailableTime.objects.all()
    serializer_class = serializers.AvailableTimeSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['id']
     
class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = serializers.DesignationSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    
class SpecialisationViewSet(viewsets.ModelViewSet):
    queryset = Specialisation.objects.all()
    serializer_class = serializers.SpecialisationSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = serializers.ReviewSerializer
    permission_classes = [IsOwnerOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['doctor', 'reviwer', 'rating']
    search_fields = ['doctor', 'reviwer']