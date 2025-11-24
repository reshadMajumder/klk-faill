# ...existing code...


from django.db import models
from uuid import uuid4
from django.conf import settings
from university.models import University,Department
from cloudinary.models import CloudinaryField






class ContributionVideos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255, null=True, blank=True)
    video_file = models.URLField(max_length=500, null=True, blank=True)
    contribution = models.ForeignKey('Contributions',on_delete=models.CASCADE,related_name='contributionVideos',null=True,blank=True)
    total_views = models.IntegerField(default=0)   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)





class ContributionNotes(models.Model):
    """
    Model for storing notes of contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255, null=True, blank=True)
    contribution=models.ForeignKey('Contributions', on_delete=models.CASCADE, related_name='contributionNotes', null=True, blank=True)
    note_file = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)





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
    thumbnail_image = CloudinaryField('thumbnail_image', blank=True, null=True)
    price = models.DecimalField(max_digits=10, default=0, decimal_places=2, null=True, blank=True, db_index=True)
    related_University = models.ForeignKey(University, related_name='contributions', on_delete=models.PROTECT, null=True, blank=True, db_index=True)
    department = models.ForeignKey(Department, related_name='contributions', on_delete=models.PROTECT, null=True, blank=True, db_index=True)  
    ratings = models.DecimalField(max_digits=3, decimal_places=2 ,default=0,null=True, blank=True, db_index=True)
    active = models.BooleanField(default=False, db_index=True)
    total_views=models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.title:
            return self.title
        return f"Contribution {self.id}"
    
    def is_enrolled(self, user):
        if not user.is_authenticated:
            return False
        return self.enrollements.filter(user=user).exists()

    def update_average_rating(self):
        from django.db.models import Avg
        avg_rating = self.contribution_ratings.aggregate(avg=Avg('rating'))['avg'] or 0
        self.ratings = round(float(avg_rating), 2)
        self.save(update_fields=['ratings'])



    class Meta:
        verbose_name_plural = "Contributions"
        indexes = [
            models.Index(fields=['title', 'course_code', 'price', 'active', 'created_at']),
            models.Index(fields=['related_University', 'user']),
        ]



class ContributionsComments(models.Model):
    """
    Model for storing comments of contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    contribution = models.ForeignKey('Contributions', on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.user and self.user.username:
            return self.user.username
        return f"Comment {self.id}"
    
