from django.db import models

from uuid import uuid4
# Create your models here.
class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name or "Unnamed Department"
    

class University(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    departments = models.ManyToManyField(Department, related_name='universities', blank=True)

    def __str__(self):
        return self.name