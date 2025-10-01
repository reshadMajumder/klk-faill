from django.contrib import admin
from django.urls import path
from .views import RegisterView, UniversityListView,VerifyOtpView
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register-user"),
    path("universities/", UniversityListView.as_view(), name="university-list"),
    path("verify-otp/", VerifyOtpView.as_view(), name="verify-otp"),
]