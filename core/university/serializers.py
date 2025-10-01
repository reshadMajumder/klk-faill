from rest_framework import serializers

from .models import Department
from .models import University

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']
        read_only_fields = ['id']

class UniversitySerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)
    class Meta:
        model = University
        fields = ['id', 'name','departments']
        read_only_fields = ['id', 'departments']



    