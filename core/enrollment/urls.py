from django.contrib import admin
from django.urls import include, path
from .views import EnrollmentView,EnrolledVideoWatch

urlpatterns = [
    path('create/', EnrollmentView.as_view(), name='enrollment-create'),
    path('list/', EnrollmentView.as_view(), name='enrollment-list'),
    path('detail/<uuid:enrollment_id>/', EnrollmentView.as_view(), name='enrollment-detail'),
    path('watch-video/<uuid:video_id>/', EnrolledVideoWatch.as_view(), name='watch-video'),

]