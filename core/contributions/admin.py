from django.contrib import admin

# Register your models here.
from .models import Contributions, ContributionTags, ContributionVideos, ContributionNotes, ContributionsComments, ContributionRatings
admin.site.register(Contributions)
admin.site.register(ContributionTags)
admin.site.register(ContributionVideos)
admin.site.register(ContributionNotes)
admin.site.register(ContributionsComments)
admin.site.register(ContributionRatings)
