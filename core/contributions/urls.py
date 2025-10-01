from django.contrib import admin
from django.urls import path

from .views import ContributionsListView



urlpatterns = [
    path("all-contributions/", ContributionsListView.as_view(), name="contributions-list"),
    path("contributions/<uuid:contribution_id>/", ContributionsListView.as_view(), name="contributions-detail"),
]

