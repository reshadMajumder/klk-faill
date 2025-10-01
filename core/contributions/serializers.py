
from rest_framework import serializers
from .models import Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings, Department
from accounts.models import University
from accounts.serializers import UniversitySerializer


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']
        read_only_fields = ['id']

class ContributionVideosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideos
        fields = ['id', 'title', 'video_file', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ContributionNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionNotes
        fields = ['id', 'note_file', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContributionsCommentsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContributionsComments
        fields = ['id', 'comment', 'user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ContributionRatingsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContributionRatings
        fields = ['id', 'user', 'rating', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        