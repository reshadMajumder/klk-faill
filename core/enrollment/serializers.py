
from rest_framework import serializers
from .models import Enrollement, ContributionVideoViewCount
class EnrollmentSerializer(serializers.ModelSerializer):

    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Enrollement
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        return Enrollement.objects.create(user=user, **validated_data)


class VideoViewCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideoViewCount
        fields = '__all__'  