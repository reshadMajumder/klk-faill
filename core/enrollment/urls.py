from django.contrib import admin
from django.urls import include, path
from .views import EnrollmentView

urlpatterns = [
    path('create/', EnrollmentView.as_view(), name='enrollment-create'),
    path('list/', EnrollmentView.as_view(), name='enrollment-list'),
    path('detail/<int:enrollment_id>/', EnrollmentView.as_view(), name='enrollment-detail'),
]