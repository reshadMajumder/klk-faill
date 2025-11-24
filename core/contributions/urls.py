from django.contrib import admin
from django.urls import path

from .views import ContributionsListView, ContributionDetailView, ContributionsView, PersonalizedContributionsView, UserContributionsView,UserContributionDetailView,ContributionVideoCreateView,ContributionNotesCreateView,ContributionCommentsView,ContributionCommentCreateView,RateContributionView



urlpatterns = [
    path("all-contributions/", ContributionsListView.as_view(), name="contributions-list"),
    path("<uuid:id>/", ContributionDetailView.as_view(), name="contributions-detail"),
    path("create/", ContributionsView.as_view(), name="create-contribution"),
    path("<uuid:contribution_id>/edit/", ContributionsView.as_view(), name="edit-contribution"),
    path("<uuid:contribution_id>/delete/", ContributionsView.as_view(), name="delete-contribution"),
    path("<uuid:contribution_id>/videos/", ContributionVideoCreateView.as_view(), name="contribution-video-create"),
    path("<uuid:contribution_id>/videos/<uuid:video_id>/", ContributionVideoCreateView.as_view(), name="contribution-video-create"),

    path("<uuid:contribution_id>/notes/", ContributionNotesCreateView.as_view(), name="contribution-video-create"),
    path("<uuid:contribution_id>/notes/<uuid:note_id>/", ContributionNotesCreateView.as_view(), name="contribution-video-create"),


    path("personalized/", PersonalizedContributionsView.as_view(), name="personalized-contributions"),
    path("user/", UserContributionsView.as_view(), name="user-contributions"),
    path("user/<uuid:contribution_id>/details/", UserContributionDetailView.as_view(), name="user-contributions"),


    path("<uuid:contribution_id>/get-comments/", ContributionCommentsView.as_view(), name="user-contribution-comments"),
    path("<uuid:contribution_id>/comments/", ContributionCommentCreateView.as_view(), name="user-contribution-comments"),
    path("<uuid:contribution_id>/comments/<uuid:comment_id>/", ContributionCommentCreateView.as_view(), name="user-contribution-comments"),

    path("<uuid:contribution_id>/rate/", RateContributionView.as_view(), name="rate-contribution"),

]

