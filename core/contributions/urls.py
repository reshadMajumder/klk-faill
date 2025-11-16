from django.contrib import admin
from django.urls import path

from .views import ContributionsListView, ContributionDetailView, ContributionsView, PersonalizedContributionsView, UserContributionsView,UserContributionDetailView,ContributionVideoCreateView



urlpatterns = [
    path("all-contributions/", ContributionsListView.as_view(), name="contributions-list"),
    path("contributions/<uuid:id>/", ContributionDetailView.as_view(), name="contributions-detail"),
    path("contributions/create/", ContributionsView.as_view(), name="create-contribution"),
    path("contributions/<uuid:contribution_id>/edit/", ContributionsView.as_view(), name="edit-contribution"),
    path("contributions/<uuid:contribution_id>/delete/", ContributionsView.as_view(), name="delete-contribution"),
    path("contributions/<uuid:contribution_id>/videos/", ContributionVideoCreateView.as_view(), name="contribution-video-create"),

    path("contributions/personalized/", PersonalizedContributionsView.as_view(), name="personalized-contributions"),
    path("contributions/user/", UserContributionsView.as_view(), name="user-contributions"),
    path("contributions/user/<uuid:contribution_id>/", UserContributionDetailView.as_view(), name="user-contributions"),

]

