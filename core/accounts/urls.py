from django.contrib import admin
from django.urls import path
from .views import RegisterView,VerifyOtpView,LoginView,LogoutView,RefreshToken,UserProfile
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register-user"),
    path("verify-otp/", VerifyOtpView.as_view(), name="verify-otp"),
    path("login/", LoginView.as_view(), name="login-user"),
    path("logout/", LogoutView.as_view(), name="login-user"),
    path("refresh/", RefreshToken.as_view(), name="login-user"),
    path("user-profile/", UserProfile.as_view(), name="login-user"),


]

