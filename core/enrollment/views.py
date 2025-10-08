from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Enrollment
from .serializers import EnrollmentSerializer




class EnrollmentView(APIView):
    """
    API endpoint to create a new enrollment.
    Also supports retrieving all enrollments or a specific enrollment by ID.

    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = EnrollmentSerializer(data=request.data)
        if serializer.is_valid():
            enrollment = serializer.save(user=user)
            data = EnrollmentSerializer(enrollment).data
            return Response({"message": "Enrollment created successfully", "data": data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def get(self, request, enrollment_id=None):
        try:
            if enrollment_id:
                enrollment = Enrollment.objects.get(id=enrollment_id)
                serializer = EnrollmentSerializer(enrollment)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                enrollments = Enrollment.objects.all().select_related('user', 'course')
                serializer = EnrollmentSerializer(enrollments, many=True)
                return Response({"message": "Enrollments retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Enrollment.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class WatchVideosView(APIView):
    """
    API endpoint to mark a video as watched in an enrollment.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, enrollment_id, video_id):
        user = request.user
        try:
            enrollment = Enrollment.objects.get(id=enrollment_id, user=user)
            if video_id not in enrollment.watched_videos:
                enrollment.watched_videos.append(video_id)
                enrollment.save()
            return Response({"message": "Video marked as watched", "data": EnrollmentSerializer(enrollment).data}, status=status.HTTP_200_OK)
        except Enrollment.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)