from django.shortcuts import render

# Create your views here.


import rest_framework
from rest_framework.views import APIView

from rest_framework import generics
from rest_framework.response import Response    
from rest_framework import status, permissions
from .models import Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
from .serializers import (BasicContributionsSerializer, ContributionsSerializer, ContributionVideosSerializer, 
                          ContributionNotesSerializer, ContributionsCommentsSerializer, ContributionRatingsSerializer, BasicContributionsSerializer, CreateContributionsSerializer,UserContributionsSerializer)  




from rest_framework.generics import ListAPIView, RetrieveAPIView

class ContributionsListView(ListAPIView):
    """
    API endpoint to list all contributions with pagination.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = BasicContributionsSerializer

    def get_queryset(self):
        queryset = Contributions.objects.all().select_related('related_University', 'department').prefetch_related('videos', 'notes', 'comments', 'contribution_ratings')
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
    API endpoint to retrieve a single contribution by id.
    """
    permission_classes = [permissions.AllowAny]
    queryset = Contributions.objects.all().select_related('related_University', 'department').prefetch_related('videos', 'notes', 'comments', 'contribution_ratings')
    serializer_class = ContributionsSerializer

    
class ContributionsView(APIView):
    """
    API endpoint to create a new contribution.
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

            contributions = Contributions.objects.filter(related_University=user_university).select_related('related_University', 'department').prefetch_related('videos', 'notes', 'comments', 'contribution_ratings')
            serializer = BasicContributionsSerializer(contributions, many=True)
            return Response({"message": "Personalized contributions retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


from rest_framework.generics import ListAPIView

class UserContributionsView(ListAPIView):
    """
    Paginated list of contributions filtered by user's university
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BasicContributionsSerializer

    def get_queryset(self):
        user = self.request.user
        return Contributions.objects.filter(user=user).select_related('related_University', 'department').prefetch_related('videos', 'notes', 'comments', 'contribution_ratings')
        

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

