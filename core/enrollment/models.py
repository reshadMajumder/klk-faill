from django.db import models

from uuid import uuid4
from django.conf import settings
from contributions.models import ContributionVideos
# Create your models here.



class ContributionVideoView(models.Model):
    """
    Model for tracking views of each video by users.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    video = models.ForeignKey(ContributionVideos, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_views')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['video', 'user']


    def __str__(self):
        if self.user and self.user.username:
            return f"{self.user.username} - {self.video.title if self.video and self.video.title else 'Unknown Video'}"
        return f"View {self.id}"
    



class Enrollement(models.Model):
    """
    Model for storing enrollements of users in contributions.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollements')
    contribution = models.ForeignKey('contributions.Contributions', on_delete=models.CASCADE, related_name='enrollements')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'contribution']


    def __str__(self):
        if self.user and self.user.username:
            return f"{self.user.username} - {self.contribution.title if self.contribution and self.contribution.title else 'Unknown Contribution'}"
        return f"Enrollement {self.id}"