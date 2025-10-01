
from rest_framework import serializers
from .models import Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
from university.models import University,Department
from university.serializers import UniversitySerializer


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
        fields = ['id', 'title', 'note_file', 'created_at', 'updated_at']
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



class BasicContributionsSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)

    
    class Meta:
        model = Contributions
        fields = ['id', 'title', 'price' ,'course_code','thumbnail_image','department', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContributionsSerializer(serializers.ModelSerializer):
    related_University = UniversitySerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    videos = ContributionVideosSerializer(many=True, read_only=True)
    notes = ContributionNotesSerializer(many=True, read_only=True)
    comments = ContributionsCommentsSerializer(many=True, read_only=True)
    contribution_ratings = ContributionRatingsSerializer(many=True, read_only=True)

    class Meta:
        model = Contributions
        fields = ['id', 'title', 'description', 'price', 'tags', 'related_University', 'department', 'videos', 'notes', 'comments', 'contribution_ratings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']