from django.shortcuts import render

# Create your views here.


from rest_framework.views import APIView
from rest_framework.response import Response    
from rest_framework import status, permissions
from .models import Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
from .serializers import (BasicContributionsSerializer, ContributionsSerializer, ContributionVideosSerializer, 
                          ContributionNotesSerializer, ContributionsCommentsSerializer, ContributionRatingsSerializer, BasicContributionsSerializer, CreateContributionsSerializer)  



class ContributionsListView(APIView):
    """
    API endpoint to list all contributions.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, contribution_id=None):
        try:
            if contribution_id:
                contribution = Contributions.objects.get(id=contribution_id)
                serializer = ContributionsSerializer(contribution)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                contributions = Contributions.objects.all().select_related('related_University', 'department').prefetch_related('videos', 'notes', 'comments', 'contribution_ratings')
                serializer = BasicContributionsSerializer(contributions, many=True)
                return Response({"message": "Contributions retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class CreateContributionsView(APIView):
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
    
class DeleteContributionsView(APIView):
    """
    API endpoint to delete a contribution.
    """
    permission_classes = [permissions.IsAuthenticated]

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
    