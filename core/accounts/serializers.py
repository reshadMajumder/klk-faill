

from .models import University,User
from rest_framework import serializers

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name']

class RegisterSerializer(serializers.ModelSerializer):
    university = serializers.PrimaryKeyRelatedField(queryset=University.objects.all())
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('first_name', 'email', 'password', 'profile_picture', 'phone_number', 'date_of_birth', 'university')

    def create(self, validated_data):
        import random, string
        first_name = validated_data.get('first_name', '')
        # Generate a random 5-character alphanumeric string
        rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
        base_username = f"{first_name.lower()}{rand_str}"
        # Ensure username is unique
        while User.objects.filter(username=base_username).exists():
            rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
            base_username = f"{first_name.lower()}{rand_str}"
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