from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer,UserProfileSerializer
from .models import User
from .email import send_otp_via_email
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken


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
    if verified send success response and jwt token access and refresh
    if not verified send error response
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            refresh = RefreshToken.for_user(user)
            access = AccessToken.for_user(user)

            if user.otp == otp:
                user.is_email_verified = True
                user.otp = None  # Clear OTP after successful verification
                user.save()

                refresh = RefreshToken.for_user(user)
                access = refresh.access_token
                return Response({
                    "message": "Email verified successfully.",
                    "refresh": str(refresh),
                    "access": str(access)
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class LoginView(APIView):
    """
    API endpoint for user login.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not password or (not username and not email):
            return Response({"error": "Username or email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = None
            if username:
                try:
                    user = User.objects.get(username=username)
                except User.DoesNotExist:
                    pass
            if user is None and email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    pass
            if user is None:
                return Response({"error": "User with this username or email does not exist."}, status=status.HTTP_404_NOT_FOUND)
            if user.check_password(password) and user.is_email_verified:
                refresh = RefreshToken.for_user(user)
                access = refresh.access_token
                return Response({
                    "message": "Login successful.",
                    "refresh": str(refresh),
                    "access": str(access)
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):

    """
    POST endpoint to blacklist a refresh token (logout)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
            token = JWTRefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CircleRefreshToken(APIView):
    """
    POST endpoint to refresh access token using refresh token
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
            token = JWTRefreshToken(refresh_token)
            access_token = str(token.access_token)
            return Response({"access": access_token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class UserProfile(APIView):
    """
    GET: Retrieve current user profile
    PUT/PATCH: Update current user profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# ===============================
# dirrect social login with Google
# ===============================

from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http_requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import random

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token") or request.data.get("id_token")

        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        google_user = None
        try:
            # Try as ID Token
            google_user = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError:
            # Try as Access Token
            try:
                resp = http_requests.get("https://www.googleapis.com/oauth2/v3/userinfo", params={"access_token": token})
                if resp.status_code == 200:
                    google_user = resp.json()
            except Exception as e:
                print(f"Google user info fetch failed: {e}")
                pass

        if not google_user:
             return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

        email = google_user.get("email")
        name = google_user.get("name")
        picture = google_user.get("picture")
        sub = google_user.get("sub")  # Google unique ID

        if not email:
            return Response({"error": "Google account has no email"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists or create new one
        try:
            user = User.objects.get(email=email)
            created = False
        except User.DoesNotExist:
            # Extract first and last name
            first_name = name.split(" ")[0] if name else ""
            last_name = " ".join(name.split(" ")[1:]) if name else ""
            
            # Generate username using the same logic as manual registration
            # Format: {first_name}_{random_2_digits}
            rand_int = random.randint(10, 99)
            base_username = f"{first_name.lower()}_{str(rand_int)}"
            
            # Ensure username is unique, if not add 4 digits
            while User.objects.filter(username=base_username).exists():
                rand_int = random.randint(1000, 9999)
                base_username = f"{first_name.lower()}_{str(rand_int)}"
            
            user = User.objects.create(
                email=email,
                username=base_username,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True,
            )
            created = True

        # Update profile picture if available and not set
        # Note: CloudinaryField handling might need specific logic if we want to upload the image
        # For now, we just pass the picture URL in the response
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            "message": "Login successful",
            "created": created,
            "access": str(access),
            "refresh": str(refresh),
            
            
        }, status=status.HTTP_200_OK)
