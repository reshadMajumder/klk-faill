from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .manager import UserManager
from django.apps import apps
from cloudinary.models import CloudinaryField

from uuid import uuid4

from university.models import University


    

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    username = models.CharField(max_length=255, unique=True, db_index=True)
    profile_picture = CloudinaryField('image', blank=True, null=True)
    is_email_verified = models.BooleanField(default=False, db_index=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    university = models.ForeignKey(University, null=True, blank=True, on_delete=models.SET_NULL)
    otp = models.CharField(max_length=6, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['username', 'email']),
            models.Index(fields=['is_email_verified', 'is_active']),
            models.Index(fields=['date_joined']),
        ]
    