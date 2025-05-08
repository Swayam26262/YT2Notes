from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class VideoNotes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    youtube_title = models.CharField(max_length=255)
    youtube_link = models.URLField()
    notes_content = models.TextField()
    transcription = models.TextField(blank=True, null=True)
    audio_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Video Notes'
    
    def __str__(self):
        return f"{self.youtube_title} - {self.user.username}"
