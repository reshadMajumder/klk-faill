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


class ContributionVideosListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionVideos
        fields = ['id', 'title']
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

class ContributionNotesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionNotes
        fields = ['id', 'title', 'created_at', 'updated_at']
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


class CreateContributionsSerializer(serializers.ModelSerializer):
    tags = ContributionsTagsSerializer(many=True, required=False)
    videos = ContributionVideosSerializer(many=True, required=False)
    notes = ContributionNotesSerializer(many=True, required=False)
    user = serializers.StringRelatedField()


    class Meta:
        model = Contributions
        fields = ['id','user', 'title', 'description', 'price', 'tags', 'related_University', 'department', 'videos', 'notes', 'ratings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'ratings']


    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        videos_data = validated_data.pop('videos', [])
        notes_data = validated_data.pop('notes', [])
        
        contribution = Contributions.objects.create(**validated_data)
        
        for tag_data in tags_data:
            tag, created = ContributionTags.objects.get_or_create(**tag_data)
            contribution.tags.add(tag)
        
        for video_data in videos_data:
            video = ContributionVideos.objects.create(**video_data)
            contribution.videos.add(video)
        
        for note_data in notes_data:
            note = ContributionNotes.objects.create(**note_data)
            contribution.notes.add(note)


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
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', [])
        videos_data = validated_data.pop('videos', [])
        notes_data = validated_data.pop('notes', [])

        # Update simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tags
        if tags_data:
            instance.tags.clear()
            for tag_data in tags_data:
                tag, created = ContributionTags.objects.get_or_create(**tag_data)
                instance.tags.add(tag)

        # Update videos
        if videos_data:
            instance.videos.clear()
            for video_data in videos_data:
                video = ContributionVideos.objects.create(**video_data)
                instance.videos.add(video)

        # Update notes
        if notes_data:
            instance.notes.clear()
            for note_data in notes_data:
                note = ContributionNotes.objects.create(**note_data)
                instance.notes.add(note)

        return instance
    
    
    

class ContributionsSerializer(serializers.ModelSerializer):
    related_University = UniversitySerializer()
    department = DepartmentSerializer()
    tags = ContributionsTagsSerializer(many=True, required=False)
    videos = ContributionVideosListSerializer(many=True, required=False)
    notes = ContributionNotesListSerializer(many=True, required=False)
    user = serializers.StringRelatedField()


    class Meta:
        model = Contributions
        fields = ['id','user', 'title', 'description', 'price', 'tags', 'related_University', 'department', 'videos', 'notes', 'ratings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        videos_data = validated_data.pop('videos', [])
        notes_data = validated_data.pop('notes', [])
        
        contribution = Contributions.objects.create(**validated_data)
        
        for tag_data in tags_data:
            tag, created = ContributionTags.objects.get_or_create(**tag_data)
            contribution.tags.add(tag)
        
        for video_data in videos_data:
            video = ContributionVideos.objects.create(**video_data)
            contribution.videos.add(video)
        
        for note_data in notes_data:
            note = ContributionNotes.objects.create(**note_data)
            contribution.notes.add(note)

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