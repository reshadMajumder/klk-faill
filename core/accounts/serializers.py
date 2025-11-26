

from .models import User
from university.models import University
from rest_framework import serializers


# Custom serializer for user profile
class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)
    class Meta:
        model = User
        fields = ('username','first_name', 'last_name', 'email', 'profile_picture', 'phone_number', 'date_of_birth', 'university', 'is_email_verified', 'date_joined', 'is_active')
        read_only_fields = ('username', 'email', 'date_joined', 'is_email_verified', 'is_active')


class RegisterSerializer(serializers.ModelSerializer):
    university = serializers.PrimaryKeyRelatedField(queryset=University.objects.all())
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password', 'profile_picture', 'phone_number', 'date_of_birth', 'university')

    def create(self, validated_data):
        import random
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        # Generate a random 4-digit integer
        rand_int = random.randint(1000, 9999)
        base_username = f"{first_name.lower()}_{last_name.lower()}_{str(rand_int)}"
        # Ensure username is unique
        while User.objects.filter(username=base_username).exists():
            rand_int = random.randint(1000, 9999)
            base_username = f"{first_name.lower()}_{last_name.lower()}_{str(rand_int)}"
        user = User(
            first_name=first_name,
            last_name=last_name,
            username=base_username,
            email=validated_data['email'],
            profile_picture=validated_data.get('profile_picture'),
            phone_number=validated_data.get('phone_number'),
            date_of_birth=validated_data.get('date_of_birth'),
            university=validated_data.get('university')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
        