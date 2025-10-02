from django.contrib import admin
from django.urls import path

from .views import ContributionsListView, CreateContributionsView



urlpatterns = [
    path("all-contributions/", ContributionsListView.as_view(), name="contributions-list"),
    path("contributions/<uuid:contribution_id>/", ContributionsListView.as_view(), name="contributions-detail"),
    path("contributions/", ContributionsListView.as_view(), name="contributions-detail"),
    path("contributions/", ContributionsListView.as_view(), name="contributions-detail"),
    path("contributions/create/", CreateContributionsView.as_view(), name="create-contribution"),
    path("contributions/<uuid:contribution_id>/edit/", CreateContributionsView.as_view(), name="edit-contribution"),
    path("contributions/<uuid:contribution_id>/delete/", CreateContributionsView.as_view(), name="delete-contribution"),
]

