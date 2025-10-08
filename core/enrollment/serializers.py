
from rest_framework import serializers
from .models import Enrollement, ContributionVideoViewCount
from contributions.serializers import ContributionsSerializer

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
class GetEnrollmentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    contribution=ContributionsSerializer()
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