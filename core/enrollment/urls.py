from django.contrib import admin
from django.urls import include, path
from .views import EnrollmentView,ContributionVideoWatch,EnrolledContributionNotesView

urlpatterns = [
    path('create/', EnrollmentView.as_view(), name='enrollment-create'),
    path('list/', EnrollmentView.as_view(), name='enrollment-list'),
    path('detail/<uuid:enrollment_id>/', EnrollmentView.as_view(), name='enrollment-detail'),
    path('watch-video/<uuid:video_id>/', ContributionVideoWatch.as_view(), name='watch-video'),
    path('get-notes/<uuid:note_id>/', EnrolledContributionNotesView.as_view(), name='get-notes'),


]