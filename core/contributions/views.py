from django.shortcuts import render

# Create your views here.


from rest_framework.views import APIView
from rest_framework.response import Response    
from rest_framework import status, permissions
from .models import Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
from .serializers import (BasicContributionsSerializer, ContributionsSerializer, ContributionVideosSerializer, 
                          ContributionNotesSerializer, ContributionsCommentsSerializer, ContributionRatingsSerializer, BasicContributionsSerializer)  



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
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Contributions.DoesNotExist:
            return Response({"error": "Contribution not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = ContributionsSerializer(data=request.data)
        if serializer.is_valid():
            contribution = serializer.save()
            return Response(ContributionsSerializer(contribution).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)