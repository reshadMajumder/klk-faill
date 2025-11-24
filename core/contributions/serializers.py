from rest_framework import serializers
from .models import  Contributions, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
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


class ContributionVideosListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideos
        fields = ['id', 'title','total_views']
        read_only_fields = ['id','total_views']

class ContributionVideosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideos
        fields = ['id', 'title', 'video_file', 'created_at','total_views', 'updated_at']
        read_only_fields = ['id', 'created_at', 'total_views','updated_at']

class ContributionNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionNotes
        fields = ['id', 'title', 'note_file', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ContributionNotesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionNotes
        fields = ['id', 'title', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']




class ContributionRatingsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContributionRatings
        fields = ['id', 'user', 'rating', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']



class BasicContributionsSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    related_University = UniversitySerializer(read_only=True)
    thumbnail_image = serializers.ImageField(read_only=True)
    
    class Meta:
        model = Contributions
        fields = ['id', 'title', 'price' ,'course_code','thumbnail_image','department','related_University','ratings','total_views', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at','total_views', 'updated_at']

    def validate(self, attrs):

        if not attrs.get('title'):
            raise serializers.ValidationError("Title is required.")
        if not attrs.get('course_code'):
            raise serializers.ValidationError("Course code is required.")
        if not attrs.get('related_University'):
            raise serializers.ValidationError("Related University is required.")
        if not attrs.get('thumbnail_image'):
            raise serializers.ValidationError("Thumbnail image is required.")
        
        return super().validate(attrs)




class ContributionDetailSerializer(serializers.ModelSerializer):
    contributionVideos = ContributionVideosListSerializer(many=True)
    contributionNotes = ContributionNotesListSerializer(many=True)
    thumbnail_image = serializers.ImageField(read_only=True)

    class Meta:
        model = Contributions
        fields = ['id','user','title','course_code','description','thumbnail_image','price','related_University','department','ratings','total_views','active','created_at','contributionVideos','contributionNotes']




class CreateContributionsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    thumbnail_image = serializers.ImageField(read_only=True)



    class Meta:
        model = Contributions
        fields = ['id','user', 'title', 'description','course_code', 'price','thumbnail_image','related_University', 'department', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at','total_views', 'updated_at', 'user']


    def create(self, validated_data):
        
        contribution = Contributions.objects.create(**validated_data)
        


        related_university = validated_data.get('related_University')
        if related_university:
            university_obj = University.objects.filter(name=related_university).first()
            if university_obj:
                contribution.related_University = university_obj
                contribution.save()

        related_department = validated_data.get('department')
        if related_department:
            department_obj = Department.objects.filter(name=related_department).first()
            if department_obj:
                contribution.department = department_obj
                contribution.save()
        return contribution
    
    # def update(self, instance, validated_data):
        

    #     # Update simple fields
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     instance.save()

       
    
    

class ContributionsSerializer(serializers.ModelSerializer):
    related_University = UniversitySerializer()
    department = DepartmentSerializer()
    thumbnail_image = serializers.ImageField(read_only=True)
    
    user = serializers.StringRelatedField()


    class Meta:
        model = Contributions
        fields = ['id','user', 'title', 'description', 'price','course_code',  'related_University', 'department', 'thumbnail_image', 'ratings','total_views', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at','total_views', 'updated_at']


    def create(self, validated_data):
       
        contribution = Contributions.objects.create(**validated_data)
        
        

        related_department = validated_data.get('department')
        if related_department:
            department_obj, created = Department.objects.get_or_create(name=related_department['name'])
            contribution.department = department_obj
            contribution.save()

        related_university = validated_data.get('related_University')
        if related_university:
            university_obj = University.objects.filter(name=related_university).first()
            if university_obj:
                contribution.related_University = university_obj
                contribution.save()
        return contribution



class ContributionsCommentsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    contribution = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContributionsComments
        fields = ['id', 'comment', 'user', 'contribution', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'contribution', 'created_at', 'updated_at']




class UserContributionsSerializer(serializers.ModelSerializer):
    related_University = UniversitySerializer()
    department = DepartmentSerializer()
    contributionVideos = ContributionVideosSerializer(many=True)
    contributionNotes = ContributionNotesSerializer(many=True)
    comments=ContributionsCommentsSerializer(many=True)
    
    user = serializers.StringRelatedField()


    class Meta:
        model = Contributions
        fields = ['id','user', 'title', 'description', 'price','course_code', 'contributionVideos','related_University','contributionNotes','comments', 'department', 'thumbnail_image', 'ratings','total_views', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at','total_views', 'updated_at']


    

