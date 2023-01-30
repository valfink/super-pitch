from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    voiceRangeMinNote = models.PositiveSmallIntegerField(blank=True, null=True)
    voiceRangeMaxNote = models.PositiveSmallIntegerField(blank=True, null=True)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "voiceRange": [self.voiceRangeMinNote, self.voiceRangeMaxNote]
        }
