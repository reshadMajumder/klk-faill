from django.shortcuts import render

# Create your views here.


import rest_framework
from rest_framework.views import APIView

from rest_framework import generics
from rest_framework.response import Response    
from rest_framework import status, permissions
from .models import Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
from .serializers import (BasicContributionsSerializer, ContributionsSerializer, ContributionVideosSerializer, ContributionDetailSerializer,
                          ContributionNotesSerializer, ContributionsCommentsSerializer, ContributionRatingsSerializer, BasicContributionsSerializer, CreateContributionsSerializer,UserContributionsSerializer)  

from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.shortcuts import get_object_or_404



class ContributionsListView(ListAPIView):
    """
    API endpoint to list all contributions with pagination.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = BasicContributionsSerializer

    def get_queryset(self):
        """
        use query params to filter contributions
        /?university=1&department=2&course_code=CS101
        /?university=1&department=2
        /?course_code=CS101

        """
        queryset = Contributions.objects.filter(active=True).select_related('related_University', 'department').prefetch_related ('comments', 'contribution_ratings')
        university_id = self.request.query_params.get('university')
        department_id = self.request.query_params.get('department')
        course_code = self.request.query_params.get('course_code')
        if university_id:
            queryset = queryset.filter(related_University__id=university_id)
        if department_id:
            queryset = queryset.filter(department__id=department_id)
        if course_code:
            queryset = queryset.filter(course_code__iexact=course_code)
        return queryset



class ContributionDetailView(RetrieveAPIView):
    """
    get the single contribution with details and also video
    notes and video will only contain title
    """
    permission_classes = [permissions.AllowAny]

    serializer_class = ContributionDetailSerializer
    queryset = Contributions.objects.filter(active=True).prefetch_related(
        'contributionVideos',
        'contributionNotes'
    ).select_related(
        'user',
        'related_University',
        'department'
    )
    lookup_field = 'id'


    
class ContributionsView(APIView):
    """
    API endpoint to create update delete a new contribution.
    """
    permission_classes = [permissions.IsAuthenticated]
    

    def post(self, request):
        user = request.user
        serializer = CreateContributionsSerializer(data=request.data)
        if serializer.is_valid():
            contribution = serializer.save(user=user)
            data = CreateContributionsSerializer(contribution).data
            return Response({"message": "Contribution created successfully", "data": data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, contribution_id):
        user = request.user
        try:
            contribution = Contributions.objects.get(id=contribution_id, user=user)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found or you do not have permission to edit this contribution."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateContributionsSerializer(contribution, data=request.data, partial=True)
        if serializer.is_valid():
            updated_contribution = serializer.save()
            data = CreateContributionsSerializer(updated_contribution).data
            return Response({"message": "Contribution updated successfully", "data": data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, contribution_id):
        user = request.user
        try:
            contribution = Contributions.objects.get(id=contribution_id, user=user)
            contribution.delete()
            return Response({"message": "Contribution deleted successfully"}, status=status.HTTP_200_OK)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found or you do not have permission to delete this contribution."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class ContributionVideoCreateView(APIView):
    """
    Create, update, and delete videos for a contribution.
    """

    def post(self, request, contribution_id):
        contribution = get_object_or_404(Contributions, id=contribution_id)

        serializer = ContributionVideosSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(contribution=contribution)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def put(self, request, contribution_id, video_id):
        video = get_object_or_404(
            ContributionVideos,
            id=video_id,
            contribution_id=contribution_id
        )

        serializer = ContributionVideosSerializer(video, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=200)

    def delete(self, request, contribution_id, video_id):
        video = get_object_or_404(
            ContributionVideos,
            id=video_id,
            contribution_id=contribution_id
        )
        video.delete()
        return Response({"message": "Video deleted"}, status=204)




class ContributionNotesCreateView(APIView):
    """
    Create, update, and delete notes for a contribution.
    """

    def post(self, request, contribution_id):
        contribution = get_object_or_404(Contributions, id=contribution_id)

        serializer = ContributionNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(contribution=contribution)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def put(self, request, contribution_id, note_id):
        note = get_object_or_404(
            ContributionNotes,
            id=note_id,
            contribution_id=contribution_id
        )

        serializer = ContributionNotesSerializer(note, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=200)

    def delete(self, request, contribution_id, note_id):
        video = get_object_or_404(
            ContributionNotes,
            id=note_id,
            contribution_id=contribution_id
        )
        video.delete()
        return Response({"message": "Video deleted"}, status=204)




class PersonalizedContributionsView(APIView):
    """
    fetch contributions filtered by user university
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            user_university = user.university
            if not user_university:
                return Response({"error": "User does not have an associated university."}, status=status.HTTP_400_BAD_REQUEST)

            contributions = Contributions.objects.filter(related_University=user_university, active=True).select_related('related_University', 'department').prefetch_related('comments', 'contribution_ratings')
            serializer = BasicContributionsSerializer(contributions, many=True)
            return Response({"message": "Personalized contributions retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



class UserContributionsView(APIView):
    """
     list of contributions filtered by user
    """
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            contributions = Contributions.objects.filter(user=user).select_related('related_University', 'department').prefetch_related( 'comments', 'contribution_ratings')
            serializer = BasicContributionsSerializer(contributions, many=True)
            return Response({"message": "Personalized contributions retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class UserContributionDetailView(APIView):
    """
    API endpoint to retrieve a single contribution by id.
    """
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, contribution_id):
        user = request.user
        try:
            contribution = Contributions.objects.get(id=contribution_id, user=user)
            serializer = UserContributionsSerializer(contribution)
            return Response({"message": "Contribution retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found or you do not have permission to view this contribution."}, status=status.HTTP_404_NOT_FOUND)



class ContributionCommentsView(APIView):
    """
    API endpoint to retrieve comments for a specific contribution.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, contribution_id):
        try:
            Contributions.objects.only('id').get(id=contribution_id, active=True)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found"}, status=404)

        comments = (
            ContributionsComments.objects
            .filter(contribution_id=contribution_id)
            .select_related('user')
        )

        serializer = ContributionsCommentsSerializer(comments, many=True)

        return Response({
            "message": "Comments retrieved successfully",
            "data": serializer.data
        })


class ContributionCommentCreateView(APIView):
    """
    API endpoint to create a comment for a specific contribution.
    """
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, contribution_id):
        user = request.user
        try:
            contribution = Contributions.objects.get(id=contribution_id, active=True)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found or inactive."}, status=status.HTTP_404_NOT_FOUND)
            

        serializer = ContributionsCommentsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user, contribution=contribution)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, contribution_id, comment_id):
        user = request.user
        try:
            comment = ContributionsComments.objects.get(id=comment_id, user=user, contribution__id=contribution_id)
        except ContributionsComments.DoesNotExist:
            return Response({"error": "Comment not found or you do not have permission to update this comment."}, status=status.HTTP_404_NOT_FOUND) 
            

        serializer = ContributionsCommentsSerializer(comment, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, contribution_id, comment_id):
        user = request.user
        try:
            comment = ContributionsComments.objects.get(id=comment_id, user=user, contribution__id=contribution_id)
        except ContributionsComments.DoesNotExist:
            return Response({"error": "Comment not found or you do not have permission to delete this comment."}, status=status.HTTP_404_NOT_FOUND) 
            

        comment.delete()
        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)



class RateContributionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, contribution_id):
        rating_value = request.data.get("rating")

        # Validate rating
        if rating_value is None:
            return Response({"error": "Rating is required"}, status=400)

        try:
            rating_value = float(rating_value)
        except ValueError:
            return Response({"error": "Invalid rating"}, status=400)

        if not (0 <= rating_value <= 5):
            return Response({"error": "Rating must be between 0 and 5"}, status=400)

        # Fetch contribution
        try:
            contribution = Contributions.objects.get(id=contribution_id, active=True)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found"}, status=404)

        # Create or update rating
        rating_obj, created = ContributionRatings.objects.update_or_create(
            user=request.user,
            contribution=contribution,
            defaults={'rating': rating_value}
        )

        # Update cached average
        contribution.update_average_rating()

        return Response({
            "message": "Rating submitted",
            "your_rating": rating_value,
            "average_rating": contribution.ratings
        })
