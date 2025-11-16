from django.db import models
from uuid import uuid4

class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ("general", "General Inquiry"),
        ("support", "Support"),
        ("business", "Business Inquiry"),
        ("feedback", "Feedback"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"
