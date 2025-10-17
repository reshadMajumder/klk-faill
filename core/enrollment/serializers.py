
from rest_framework import serializers
from .models import Enrollement, ContributionVideoViewCount,Contributions
from contributions.serializers import ContributionsSerializer,UniversitySerializer,DepartmentSerializer,ContributionsTagsSerializer,ContributionVideosSerializer,ContributionNotesSerializer
from contributions.models import ContributionVideos

class EnrollmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)


    class Meta:
        model = Enrollement
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        contribution = validated_data.get('contribution')
        if Enrollement.objects.filter(user=user, contribution=contribution).exists():
            raise serializers.ValidationError("User is already enrolled in this contribution.")
        return Enrollement.objects.create(user=user, **validated_data)


class EnrollmentContributionViewSerializer(serializers.ModelSerializer):

    related_University = UniversitySerializer()
    department = DepartmentSerializer()
    tags = ContributionsTagsSerializer(many=True, required=False)
    videos = ContributionVideosSerializer(many=True, required=False)
    notes = ContributionNotesSerializer(many=True, required=False)
    user = serializers.StringRelatedField()


    class Meta:
        model = Contributions
        fields = ['id','user', 'title', 'description', 'price','course_code', 'tags', 'related_University', 'department', 'thumbnail_image','videos', 'notes', 'ratings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GetEnrollmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    contribution=ContributionsSerializer()
    class Meta:
        model = Enrollement
        fields = '__all__'

class GetEnrollmentDetailSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    contribution=EnrollmentContributionViewSerializer()
    class Meta:
        model = Enrollement
        fields = '__all__'
class VideoViewCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideoViewCount
        fields = '__all__'  



class ContributionVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideos
        fields = '__all__'