from django.db import models
from uuid import uuid4
from django.conf import settings
from accounts.models import University






class ContributionVideos(models.Model):
    """
    Model for storing contribution videos.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255, null=True, blank=True)
    video_file = models.FileField(upload_to='contribution_videos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ContributionTags(models.Model):
    """
    Model for storing tags of contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)



class ContributionNotes(models.Model):
    """
    Model for storing notes of contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    note_file = models.FileField(upload_to='contribution_notes/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ContributionsComments(models.Model):
    """
    Model for storing comments of contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    comment = models.TextField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.user and self.user.username:
            return self.user.username
        return f"Comment {self.id}"


class ContributionRatings(models.Model):
    """
    Model for storing ratings of contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    contribution = models.ForeignKey('Contributions', on_delete=models.CASCADE, related_name='contribution_ratings')
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.user and self.user.username:
            return self.user.username
        return f"Rating {self.id}"
    
    class Meta:
        unique_together = ['user', 'contribution']  # Prevent duplicate ratings



class Contributions(models.Model):
    """
    Model for storing contributions of users.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='contributions', on_delete=models.CASCADE, null=True, blank=True, db_index=True)
    title = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    course_code = models.CharField(max_length=50, null=True, blank=True, db_index=True)
    description = models.TextField(null=True, blank=True)
    thumbnail_image = models.ImageField(upload_to='thumbnail_images/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, default=0, decimal_places=2, null=True, blank=True, db_index=True)
    tags = models.ManyToManyField('ContributionTags', related_name='contributions')
    related_University = models.ForeignKey(University, related_name='contributions', on_delete=models.PROTECT, null=True, blank=True, db_index=True)
    department = models.ForeignKey('university.Department', related_name='contributions', on_delete=models.PROTECT, null=True, blank=True, db_index=True)
    videos= models.ManyToManyField('ContributionVideos', related_name='contributions', blank=True)
    notes = models.ManyToManyField('ContributionNotes', related_name='contributions', blank=True)
    comments = models.ManyToManyField('ContributionsComments', related_name='contributions', blank=True)
    ratings = models.ManyToManyField('ContributionRatings', related_name='contributions_ratings', blank=True)
    active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.title:
            return self.title
        return f"Contribution {self.id}"

    class Meta:
        verbose_name_plural = "Contributions"
        indexes = [
            models.Index(fields=['title', 'course_code', 'price', 'active', 'created_at']),
            models.Index(fields=['related_University', 'user']),
        ]

