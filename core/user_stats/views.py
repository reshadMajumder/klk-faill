from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from contributions.models import Contributions, ContributionsComments, ContributionRatings
from django.db.models import Sum, Count

# Create your views here.


#  user stats view , user can see his total lifetime view, contribution, contribution views, contribution comments, contribution ratings 

class UserStatsView(APIView):
    def get(self, request):
        user = request.user
        
        # Total views across all contributions
        total_views = Contributions.objects.filter(user=user).aggregate(total_views=Sum('total_views'))['total_views'] or 0
        
        # Total number of contributions
        total_contributions = Contributions.objects.filter(user=user).count()
        
        # Total comments on user's contributions
        total_contribution_comments = ContributionsComments.objects.filter(contribution__user=user).count()
        
        # Total ratings on user's contributions
        total_contribution_ratings = ContributionRatings.objects.filter(contribution__user=user).count()
        
        return Response({
            'total_views': total_views,
            'total_contributions': total_contributions,
            'total_contribution_comments': total_contribution_comments,
            'total_contribution_ratings': total_contribution_ratings
        })