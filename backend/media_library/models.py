from django.db import models

class MediaAsset(models.Model):
    file = models.FileField(upload_to='library/')
    title = models.CharField(max_length=200, blank=True)
    caption = models.TextField(blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or self.file.name

    def save(self, *args, **kwargs):
        if not self.title:
            # Default title to file name
            self.title = self.file.name.split('/')[-1]
        super().save(*args, **kwargs)
