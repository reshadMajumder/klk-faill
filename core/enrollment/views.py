from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from contributions.models import ContributionVideos
from .models import ContributionVideoViewCount,Enrollement
from .serializers import EnrollmentSerializer,GetEnrollmentSerializer,GetEnrollmentDetailSerializer
from django.db import IntegrityError
from django.shortcuts import get_object_or_404



class EnrollmentView(APIView):
    """
    API endpoint to create a new enrollment.
    Also supports retrieving all enrollments or a specific enrollment by ID.

    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        serializer = EnrollmentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            enrollment = serializer.save()
            data = EnrollmentSerializer(enrollment).data
            return Response({"message": "Enrollment created successfully", "data": data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def get(self, request, enrollment_id=None):
        user=request.user
        try:
            if enrollment_id:
                enrollment = Enrollement.objects.get(id=enrollment_id)
                serializer = GetEnrollmentDetailSerializer(enrollment)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                enrollments = Enrollement.objects.filter(user=user).select_related('user', 'contribution')
                serializer = GetEnrollmentSerializer(enrollments, many=True)
                return Response({"message": "Enrollments retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Enrollement.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ContributionVideoWatch(APIView):
    """
    Track a unique view for a video and return the video file URL.
    """
    def get(self, request, video_id):
        user = request.user
        video = get_object_or_404(ContributionVideos, id=video_id)
        contribution = video.contribution

        # Count unique view
        try:
            ContributionVideoViewCount.objects.create(
                video=video,
                user=user
            )
            # If created → increment counters
            video.total_views = video.total_views + 1
            video.save(update_fields=["total_views"])

            contribution.total_views = contribution.total_views + 1
            contribution.save(update_fields=["total_views"])

        except IntegrityError:
            # Already viewed → don’t increment
            pass

        # Return the actual video URL
        return Response(
            {
                "video_id": str(video.id),
                "title": video.title,
                "video_url": video.video_file,
                "total_views": video.total_views,
            },
            status=200
        )