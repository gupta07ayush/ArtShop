
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Artwork
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
import io, random

class Command(BaseCommand):
    help = 'Seed demo users and artworks with placeholder images'

    def handle(self, *args, **options):
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user('demo', password='demo123')
            self.stdout.write('Created user: demo / demo123')

        if not User.objects.filter(username='Ayush').exists():
            User.objects.create_user('Ayush', password='Ayush123')
            self.stdout.write('Created user: Ayush / Ayush123')

        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write('Created superuser: admin / admin123')

        titles = [('Sunset Vibes','Warm tones'), ('Ocean Calm','Minimal blue'), ('City Lights','Night skyline'), ('Forest Mist','Green hues')]
        for i, (t,d) in enumerate(titles, start=1):
            if Artwork.objects.filter(title=t).exists():
                continue
            img = Image.new('RGB', (800,600), color=(int(random.random()*255), int(random.random()*255), int(random.random()*255)))
            draw = ImageDraw.Draw(img)
            try:
                f = ImageFont.load_default()
                draw.text((40,40), t, font=f, fill=(255,255,255))
            except Exception:
                draw.text((40,40), t, fill=(255,255,255))
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            buf.seek(0)
            name = f'artwork_seed_{i}.png'
            art = Artwork(title=t, description=d, price=round(100 + random.random()*200,2))
            art.image.save(name, ContentFile(buf.read()), save=True)
            self.stdout.write(f'Created artwork: {t}')
        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
