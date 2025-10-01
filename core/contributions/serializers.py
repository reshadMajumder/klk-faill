
from rest_framework import serializers
from .models import ContributionTags, Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
from university.models import University,Department

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name']
        read_only_fields = ['id']
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


class ContributionsTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionTags
        fields = ['id', 'name']
        read_only_fields = ['id']


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
        fields = ['id', 'title', 'price' ,'course_code','thumbnail_image','department','ratings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContributionsSerializer(serializers.ModelSerializer):
    related_University = UniversitySerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    tags = ContributionsTagsSerializer(many=True)
    videos = ContributionVideosSerializer(many=True)
    notes = ContributionNotesSerializer(many=True)

    class Meta:
        model = Contributions
        fields = ['id', 'title', 'description', 'price', 'tags', 'related_University', 'department', 'videos', 'notes', 'ratings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']



class ContributionsCommentsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    contribution = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContributionsComments
        fields = ['id', 'comment', 'user', 'contribution', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'contribution', 'created_at', 'updated_at']