from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from contributions.models import ContributionVideos
from .models import ContributionVideoViewCount,Enrollement
from .serializers import EnrollmentSerializer




class EnrollmentView(APIView):
    """
    API endpoint to create a new enrollment.
    Also supports retrieving all enrollments or a specific enrollment by ID.

    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = EnrollmentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            enrollment = serializer.save()
            data = EnrollmentSerializer(enrollment).data
            return Response({"message": "Enrollment created successfully", "data": data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def get(self, request, enrollment_id=None):
        try:
            if enrollment_id:
                enrollment = Enrollement.objects.get(id=enrollment_id)
                serializer = EnrollmentSerializer(enrollment)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                enrollments = Enrollement.objects.all().select_related('user', 'contribution').prefetch_related('contribution__videos', 'contribution__notes')
                serializer = EnrollmentSerializer(enrollments, many=True)
                return Response({"message": "Enrollments retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Enrollement.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
