# Custom serializer for user profile
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'profile_picture', 'phone_number', 'date_of_birth', 'university', 'is_email_verified', 'date_joined', 'is_active')
        read_only_fields = ('username', 'email', 'date_joined', 'is_email_verified', 'is_active')


from .models import User
from university.models import University
from rest_framework import serializers




class RegisterSerializer(serializers.ModelSerializer):
    university = serializers.PrimaryKeyRelatedField(queryset=University.objects.all())
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('first_name', 'email', 'password', 'profile_picture', 'phone_number', 'date_of_birth', 'university')

    def create(self, validated_data):
        import random
        first_name = validated_data.get('first_name', '')
        # Generate a random 6-digit integer
        rand_int = random.randint(100000, 999999)
        base_username = f"{first_name.lower()}_{str(rand_int)}"
        # Ensure username is unique
        while User.objects.filter(username=base_username).exists():
            rand_int = random.randint(100000, 999999)
            base_username = f"{first_name.lower()}_{str(rand_int)}"
        user = User(
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