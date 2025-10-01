from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer,UniversitySerializer
from .models import University,User
from .email import send_otp_via_email

class UniversityListView(APIView):
    """
    API endpoint to list all universities.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            universities = University.objects.all()
            serializer = UniversitySerializer(universities, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self, request):
        serializer = UniversitySerializer(data=request.data)
        if serializer.is_valid():
            university = serializer.save()
            return Response(UniversitySerializer(university).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class RegisterView(APIView):
    """
    API endpoint for user registration.
    for now register user but keep the email unverified
    send otp to email for verification
    After verification, set is_email_verified to True

    """
    permission_classes = [permissions.AllowAny]    

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_otp_via_email(user.email)
            return Response({"message": f"otp sent to {user.email}"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOtpView(APIView):
    """
    API endpoint to verify OTP for email verification.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.otp == otp:
                user.is_email_verified = True
                user.otp = None  # Clear OTP after successful verification
                user.save()
                return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)