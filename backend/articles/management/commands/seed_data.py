import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from articles.models import Category, Tag, Article, Comment
from ads.models import AdSlot
from layout.models import HomepageLayout, SiteSetting
from newsletter.models import Subscriber

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds realistic, non-technical editorial content for PressPoint digital newspaper'

    def handle(self, *args, **kwargs):
        self.stdout.write('Purging old data...')
        Article.objects.all().delete()
        Category.objects.all().delete()
        Tag.objects.all().delete()
        AdSlot.objects.all().delete()
        HomepageLayout.objects.all().delete()
        SiteSetting.objects.all().delete()
        Subscriber.objects.all().delete()

        self.stdout.write('Seeding database with realistic content...')

        # 1. Create Users
        self.stdout.write('- Creating users...')
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@presspoint.com',
                'first_name': 'Amani',
                'last_name': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('pulse_admin_pass')
            admin_user.save()

        editor_user, created = User.objects.get_or_create(
            username='editor_alex',
            defaults={
                'email': 'alex@presspoint.com',
                'first_name': 'Alex',
                'last_name': 'Editor',
                'role': 'editor',
                'is_staff': True
            }
        )
        if created:
            editor_user.set_password('pulse_editor_pass')
            editor_user.save()

        journalist1, created = User.objects.get_or_create(
            username='writer_elena',
            defaults={
                'email': 'elena@presspoint.com',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': 'journalist',
                'bio': 'Elena reports on design, urban culture, and public spaces.',
                'twitter': 'https://twitter.com/elena_rostova'
            }
        )
        if created:
            journalist1.set_password('pulse_writer_pass')
            journalist1.save()

        journalist2, created = User.objects.get_or_create(
            username='writer_marcus',
            defaults={
                'email': 'marcus@presspoint.com',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'role': 'journalist',
                'bio': 'Marcus covers business, sustainability practices, and nature conservation.',
                'twitter': 'https://twitter.com/marcus_vance'
            }
        )
        if created:
            journalist2.set_password('pulse_writer_pass')
            journalist2.save()

        reader1, created = User.objects.get_or_create(
            username='reader_jane',
            defaults={
                'email': 'jane@presspoint.com',
                'first_name': 'Jane',
                'last_name': 'Doe',
                'role': 'reader'
            }
        )
        if created:
            reader1.set_password('pulse_reader_pass')
            reader1.save()

        # 2. Create Categories
        self.stdout.write('- Creating categories...')
        business_cat = Category.objects.create(slug='business', name='Business', color_accent='#2a69ac', order=1)
        fashion_cat = Category.objects.create(slug='fashion', name='Fashion', color_accent='#df4d38', order=2)
        culture_cat = Category.objects.create(slug='culture', name='Culture', color_accent='#d8b13a', order=3)
        tech_cat = Category.objects.create(slug='technology', name='Technology', color_accent='#2fb16b', order=4)
        design_cat = Category.objects.create(slug='design', name='Design', color_accent='#df4d38', order=5)
        nature_cat = Category.objects.create(slug='nature', name='Nature', color_accent='#8e5ab1', order=6)
        health_cat = Category.objects.create(slug='health', name='Health', color_accent='#2394ac', order=7)

        # 3. Create Tags
        self.stdout.write('- Creating tags...')
        tags_list = ['Sustainability', 'Local Business', 'Art Galleries', 'Creative Office', 'Conservation', 'Wellbeing', 'Summer Style']
        tags_dict = {}
        for tag_name in tags_list:
            tag = Tag.objects.create(slug=slugify(tag_name), name=tag_name)
            tags_dict[tag_name] = tag

        # 4. Create Articles
        self.stdout.write('- Creating articles...')
        
        # Article 1: Lead Hero (Design/Architecture)
        art1 = Article.objects.create(
            slug='clean-grid-creative-office-spaces',
            title='The Clean Grid: Restructuring Office Spaces for Open Collaboration',
            subtitle='How local architects are designing modern workspaces that prioritize natural light, natural ventilation, and quiet areas for work.',
            body=(
                'In recent years, the structure of the modern workspace has undergone a major shift. '
                'Rather than traditional cubicles or noisy open-plan layouts, designers are turning toward '
                'flexible grid architectures. These designs create modular spaces that can easily be '
                'reconfigured depending on team needs.\n\n'
                '### The Importance of Natural Light\n'
                'One of the key priorities in these new architectural plans is ensuring that natural light '
                'reaches every desk. Studies have shown that access to daylight significantly improves '
                'productivity, mood, and sleep quality for office employees. By placing desks around '
                'the perimeter of the floor and utilizing glass dividers, light flows freely throughout the space.\n\n'
                '### Quiet Spaces and Focus Nodes\n'
                'While collaborative tables are useful for group brainstorming, quiet individual workspaces '
                'are equally critical. Architects are designing small, soundproof phone booths and '
                'dedicated reading rooms where employees can focus on deep work without interruption. '
                'This balance of social and private spaces creates a balanced workplace dynamic.'
            ),
            cover_image='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
            category=design_cat,
            author=journalist1,
            status='published',
            is_breaking=True,
            is_featured=True,
            is_premium=False,
            reading_time=6,
            view_count=1240,
            published_at=timezone.now() - datetime.timedelta(hours=2)
        )
        art1.tags.add(tags_dict['Creative Office'], tags_dict['Sustainability'])

        # Article 2: Business Card
        art2 = Article.objects.create(
            slug='sustainable-commerce-local-logistics',
            title='Sustainable Commerce: Navigating Local Logistics Challenges',
            subtitle='Local supply chain companies are adopting electric fleets and optimized route software to reduce neighborhood carbon outputs.',
            body=(
                'Moving goods across urban centers has always been a logistical challenge. Now, local delivery '
                'companies are rethinking their carbon footprint. By integrating electric delivery trucks '
                'and cargo bikes, businesses are managing to keep shipping times low while decreasing emission values.\n\n'
                '### Route Optimization Tools\n'
                'In addition to cleaner vehicles, companies are utilizing advanced route planning software. '
                'These systems analyze traffic grids in real-time, sending drivers on the most efficient paths '
                'and preventing trucks from idling in neighborhood congestion blocks.'
            ),
            cover_image='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
            category=business_cat,
            author=journalist2,
            status='published',
            is_breaking=False,
            is_featured=False,
            is_premium=False,
            reading_time=4,
            view_count=872,
            published_at=timezone.now() - datetime.timedelta(hours=6)
        )
        art2.tags.add(tags_dict['Local Business'], tags_dict['Sustainability'])

        # Article 3: Fashion Card
        art3 = Article.objects.create(
            slug='minimalist-styles-sustainable-patterns',
            title='Minimalist Styles: The Rise of Sustainable Print Patterns',
            subtitle='How designers are using natural dyes and recycled fibers to craft elegant, durable silhouettes for summer wardrobe setups.',
            body=(
                'Sustainable fashion is no longer a niche market. Designers this summer are focusing heavily on '
                'recyclable materials and ethical production chains. From organic cotton shirts to dresses '
                'dyed with vegetable extracts, the emphasis is on durability and environmental impact.'
            ),
            cover_image='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
            category=fashion_cat,
            author=journalist1,
            status='published',
            is_breaking=False,
            is_featured=False,
            is_premium=False,
            reading_time=5,
            view_count=521,
            published_at=timezone.now() - datetime.timedelta(hours=12)
        )
        art3.tags.add(tags_dict['Summer Style'], tags_dict['Sustainability'])

        # Article 4: Nature Card
        art4 = Article.objects.create(
            slug='forest-conservation-upstate-parks',
            title='Forest Conservation Efforts Show Promising Results in Upstate Parks',
            subtitle='Environmental agencies report a healthy recovery of native plant life and stabilized soil banks following a three-year protection program.',
            body=(
                'A joint study by local environmental groups has confirmed that upstate woodlands are undergoing '
                'a major ecological recovery. By controlling traffic paths and replanting native seedlings, '
                'biodiversity index scores have risen by twelve percent.'
            ),
            cover_image='https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
            category=nature_cat,
            author=journalist2,
            status='published',
            is_breaking=False,
            is_featured=False,
            is_premium=False,
            reading_time=7,
            view_count=988,
            published_at=timezone.now() - datetime.timedelta(days=1)
        )
        art4.tags.add(tags_dict['Conservation'])

        # Article 5: Culture Card (Premium)
        art5 = Article.objects.create(
            slug='modern-museums-digital-art-preservation',
            title='Modern Museums and the Digital Preservation of Fine Art',
            subtitle='How gallery archives are utilizing high-definition scans and virtual tours to make historical collections accessible to a global audience.',
            body=(
                'Museums around the world are undergoing a quiet revolution. By digitizing their historical galleries '
                'using 3D laser scanners, fine art pieces can be studied by students anywhere in the world. '
                'This preservation effort ensures that even if physical artifacts degrade over centuries, '
                'their digital representations remain perfect for research.'
            ),
            cover_image='https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
            category=culture_cat,
            author=journalist1,
            status='published',
            is_breaking=False,
            is_featured=False,
            is_premium=True,
            reading_time=6,
            view_count=612,
            published_at=timezone.now() - datetime.timedelta(days=2)
        )
        art5.tags.add(tags_dict['Art Galleries'])

        # Article 6: Health Card
        art6 = Article.objects.create(
            slug='balance-recovery-importance-micro-breaks',
            title='Balance and Recovery: The Importance of Micro-Breaks During Workdays',
            subtitle='New research indicates that taking short two-minute walks every hour helps maintain focus and prevents physical strain.',
            body=(
                'Sitting at a desk for eight hours takes a toll on physical health and mental focus. '
                'Health practitioners are urging employees to take brief micro-breaks throughout the day. '
                'Standing up, stretching, or simply looking away from screens for a few minutes helps '
                'relax eyes and keeps energy levels balanced.'
            ),
            cover_image='https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop',
            category=health_cat,
            author=journalist2,
            status='published',
            is_breaking=False,
            is_featured=False,
            is_premium=False,
            reading_time=3,
            view_count=1450,
            published_at=timezone.now() - datetime.timedelta(days=3)
        )
        art6.tags.add(tags_dict['Wellbeing'])

        # 5. Create Comments
        self.stdout.write('- Creating comments...')
        Comment.objects.create(
            article=art1,
            user=reader1,
            body="This design is beautiful! I love how clear and quiet the workspaces look. Very inspiring.",
            status='approved'
        )
        Comment.objects.create(
            article=art1,
            user=editor_user,
            body="Excellent writing. It is great to highlight how design directly influences everyday productivity.",
            status='approved'
        )

        # 6. Create Ad Slots
        self.stdout.write('- Creating ad slots...')
        AdSlot.objects.create(
            name='Modern Office Furnishings',
            placement='in-feed-native',
            target_url='https://example.com/furniture',
            image='https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
            cta_text='Shop Now',
            start_date=timezone.now(),
            end_date=timezone.now() + datetime.timedelta(days=30),
            priority=1,
            is_active=True
        )
        AdSlot.objects.create(
            name='Independent Coffee Roasters',
            placement='sidebar-rail',
            target_url='https://example.com/coffee',
            image='https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',
            cta_text='Order Now',
            start_date=timezone.now(),
            end_date=timezone.now() + datetime.timedelta(days=30),
            priority=1,
            is_active=True
        )

        # 7. Homepage Layouts
        self.stdout.write('- Creating homepage layout configuration...')
        HomepageLayout.objects.create(section_type='hero', order=0)
        HomepageLayout.objects.create(section_type='featured-grid', order=1)
        HomepageLayout.objects.create(section_type='category-rail', order=2, category=design_cat)
        HomepageLayout.objects.create(section_type='ad-slot', order=3)
        HomepageLayout.objects.create(section_type='trending-widget', order=4)

        # 8. Site Settings Singleton
        self.stdout.write('- Creating site settings singleton...')
        SiteSetting.objects.create(
            site_name='PressPoint',
            primary_color='#df4d38',
            maintenance_mode=False,
            footer_text='PressPoint Daily Gazette. Est. 2026.'
        )

        # 9. Subscribers
        self.stdout.write('- Subscribing default emails...')
        Subscriber.objects.create(email='reader.jane@gmail.com')
        Subscriber.objects.create(email='writer.marcus@gmail.com')

        self.stdout.write('Database successfully seeded!')
