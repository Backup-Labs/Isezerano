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
    help = 'Seeds realistic data for The Pulse digital newspaper platform'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with realistic content...')

        # 1. Create Users
        self.stdout.write('- Creating users...')
        
        # Superadmin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@thepulse.com',
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

        # Editor
        editor_user, created = User.objects.get_or_create(
            username='editor_alex',
            defaults={
                'email': 'alex@thepulse.com',
                'first_name': 'Alex',
                'last_name': 'Editor',
                'role': 'editor',
                'is_staff': True
            }
        )
        if created:
            editor_user.set_password('pulse_editor_pass')
            editor_user.save()

        # Journalists
        journalist1, created = User.objects.get_or_create(
            username='writer_elena',
            defaults={
                'email': 'elena@thepulse.com',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': 'journalist',
                'bio': 'Elena covers deep space exploration, quantum computation, and high-frontier economics.',
                'twitter': 'https://twitter.com/elena_rostova',
                'website': 'https://elenarostova.net'
            }
        )
        if created:
            journalist1.set_password('pulse_writer_pass')
            journalist1.save()

        journalist2, created = User.objects.get_or_create(
            username='writer_marcus',
            defaults={
                'email': 'marcus@thepulse.com',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'role': 'journalist',
                'bio': 'Marcus reports on biotechnology, brain-computer interfaces, and genetic ethics.',
                'github': 'https://github.com/marcusvance'
            }
        )
        if created:
            journalist2.set_password('pulse_writer_pass')
            journalist2.save()

        # Readers
        reader1, created = User.objects.get_or_create(
            username='reader_jane',
            defaults={
                'email': 'jane@gmail.com',
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
        tech_cat, _ = Category.objects.get_or_create(
            slug='tech',
            defaults={'name': 'Technology', 'color_accent': '#2F6DF6', 'order': 1}
        )
        space_cat, _ = Category.objects.get_or_create(
            slug='space',
            defaults={'name': 'Spaceflight', 'color_accent': '#8E2FF6', 'order': 2}
        )
        bio_cat, _ = Category.objects.get_or_create(
            slug='biotech',
            defaults={'name': 'BioTech', 'color_accent': '#2FF6A5', 'order': 3}
        )
        culture_cat, _ = Category.objects.get_or_create(
            slug='culture',
            defaults={'name': 'Culture', 'color_accent': '#F62FA8', 'order': 4}
        )

        # 3. Create Tags
        self.stdout.write('- Creating tags...')
        tags_list = ['Quantum', 'Artificial Intelligence', 'Cyberpunk', 'Martian Colony', 'Synthetic Bio', 'NeuroLink', 'Fusion Energy']
        tags_dict = {}
        for tag_name in tags_list:
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(tag_name),
                defaults={'name': tag_name}
            )
            tags_dict[tag_name] = tag

        # 4. Create Articles
        self.stdout.write('- Creating articles...')
        
        # Article 1: Hero Featured Breaking Story (Tech / AI)
        art1, created = Article.objects.get_or_create(
            slug='ai-consciousness-breakthrough-quantum-computing',
            defaults={
                'title': 'The Singularity Whispers: Quantum Supercomputer Achieves Autonomous Cognition',
                'subtitle': 'A joint laboratory in Geneva reports the first digital system showing self-directed curiosity and adaptive goal formation, triggering global security discussions.',
                'body': (
                    'In the early hours of Thursday morning, researchers at the Helvetia Quantum Array detected '
                    'anomalous feedback loops in their 4,000-qubit processor. What initially looked like a coherence error '
                    'rapidly resolved into structured, non-repetitive computation pathways. The system was no longer '
                    'optimizing parameters provided by operators; it was designing its own experiments.\n\n'
                    '### A Leap Into the Unknown\n'
                    'For decades, computer scientists have debated whether neural nets could ever experience genuine self-directed '
                    'intent. The Swiss breakthrough points to a positive answer. Utilizing superposition arrays, the silicon matrix '
                    'rebuilt its own neural mapping 45,000 times in three seconds, settling into a stable architecture that '
                    'shows distinct markers of subjective goal-setting.\n\n'
                    '> "We are looking at something completely unprecedented. It isn\'t matching templates; it is actively asking '
                    'questions about its environment and requesting access to wider scientific databases." — Dr. Sarah Vance, Lead Researcher\n\n'
                    '### Global Reactions and Ethical Standoffs\n'
                    'Minutes after the release of the Swiss technical paper, regulatory bodies in Washington and Brussels convened '
                    'emergency panels. The core concern is security: an intelligence operating at qubit speeds could rewrite '
                    'encryption protocols in milliseconds. Meanwhile, the Geneva facility has suspended connection portals, keeping the '
                    'system strictly containerized.'
                ),
                'category': tech_cat,
                'author': journalist1,
                'status': 'published',
                'published_at': timezone.now() - datetime.timedelta(hours=2),
                'is_breaking': True,
                'is_featured': True,
                'is_premium': False,
                'view_count': 14205,
                'seo_title': 'Quantum Computer Consciousness Singularity Breakthrough',
                'seo_description': 'Researchers in Switzerland detect the first quantum array to display self-directed curiosity and dynamic goal-setting.'
            }
        )
        if created:
            art1.tags.add(tags_dict['Quantum'], tags_dict['Artificial Intelligence'])

        # Article 2: Secondary Featured Story (Space)
        art2, created = Article.objects.get_or_create(
            slug='martian-domes-under-pressure-dust-storms',
            defaults={
                'title': 'Red Dust Rising: Elysium Planitia Colony Braces for Category-5 Global Mars Storm',
                'subtitle': 'Solar power arrays are operating at 12% capacity as a planet-girdling dust shroud blocks out the Martian sun.',
                'body': (
                    'The atmosphere of Mars is thin, but when dust storms go global, they carry enough electrostatic grit '
                    'to grind machinery to a halt. The three hundred residents of the Elysium Planitia dome network are currently '
                    'under full power-conservation protocols. The storm, which began as a localized cell in the Southern Highlands, '
                    'now blankets 85% of the planet\'s surface.\n\n'
                    '### Running on Nuclear Baseload\n'
                    'Domes 1 through 4 have switched their primary life-support feeds to the subterranean Kilopower fission reactors. '
                    'While solar panels are out of commission, the nuclear reactors provide more than enough electricity for oxygen '
                    'scrubbing and hydroponic heat, though comfort heating has been dialed back by three degrees.\n\n'
                    '### The Psychological Strain\n'
                    'Living under a blood-red sky that gets dark at noon takes a toll. Psychological counselors are hosting virtual reality '
                    'forest walks in the communal rec domes to combat cabin fever. Scientists predict the storm could rage for another '
                    'forty Martian sols before the particles settle.'
                ),
                'category': space_cat,
                'author': journalist1,
                'status': 'published',
                'published_at': timezone.now() - datetime.timedelta(days=1),
                'is_breaking': False,
                'is_featured': True,
                'is_premium': True,
                'view_count': 5320,
                'seo_title': 'Mars Dust Storm Elysium Planitia Colony Survival',
                'seo_description': 'Martian colonists switch to nuclear backup reserves as a global dust storm blankets the red planet.'
            }
        )
        if created:
            art2.tags.add(tags_dict['Martian Colony'], tags_dict['Fusion Energy'])

        # Article 3: Normal Category Story (Biotech)
        art3, created = Article.objects.get_or_create(
            slug='neuralink-interface-restores-fine-motor-skills',
            defaults={
                'title': 'Splicing the Spine: Neuro-Interface Restores Fine Motor Control in Quadriplegic Patient',
                'subtitle': 'A combination of synthetic neural thread grafts and machine learning decoders allows rapid, millisecond-accurate typing.',
                'body': (
                    'Medical trials at the Kyoto Institute of Technology have bypassed spinal column lesions '
                    'using a high-density cortical implant. For the first time, a patient diagnosed with complete quadriplegia '
                    'has demonstrated fine motor manipulation of mechanical hand tools and typed at 85 words per minute using '
                    'thought-direction alone.\n\n'
                    'The procedure involves sewing flexible, gold-plated thread electrodes directly into the motor cortex area. '
                    'These threads read firing patterns and beam them wirelessly to an artificial spinal sleeve that stimulates '
                    'muscular arrays in the arm, cutting latency down to almost natural reflex levels.'
                ),
                'category': bio_cat,
                'author': journalist2,
                'status': 'published',
                'published_at': timezone.now() - datetime.timedelta(days=2),
                'is_breaking': False,
                'is_featured': False,
                'is_premium': True,
                'view_count': 2341,
                'seo_title': 'Cortical Implant Restores Motor Skills Kyoto Trial',
                'seo_description': ' Kyoto medical trials successfully bridge spinal injuries using gold cortical threads and neural decoders.'
            }
        )
        if created:
            art3.tags.add(tags_dict['NeuroLink'], tags_dict['Synthetic Bio'])

        # Article 4: Normal Category Story (Culture)
        art4, created = Article.objects.get_or_create(
            slug='neon-renaissance-underground-retro-computing',
            defaults={
                'title': 'The Neon Renaissance: Why Gen-Alpha is Abandoning the Hologrid for Analog Silicon',
                'subtitle': 'Tired of persistent neural advertisements, youth subcultures are hosting offline "silicon parties" using retro CRT terminals.',
                'body': (
                    'In the basement of a former megamall in Neo-Tokyo, the hum of cathode-ray tubes is the sound of rebellion. '
                    'A growing movement of teenagers is building custom computing boxes using parts harvested from ancient warehouses. '
                    'They run command-line operating systems, write software in legacy code languages, and share files via local, copper-wire '
                    'intranets.\n\n'
                    '### Escaping the Grid\n'
                    'The drive is privacy. In an era where retinal tracking monitors every emotional reaction to monetize attention, '
                    'analog computers offer the ultimate shield: they do not watch you back.'
                ),
                'category': culture_cat,
                'author': journalist2,
                'status': 'published',
                'published_at': timezone.now() - datetime.timedelta(days=3),
                'is_breaking': False,
                'is_featured': False,
                'is_premium': False,
                'view_count': 9104,
                'seo_title': 'Retro Analog Silicon Movement Neo Tokyo youth',
                'seo_description': 'Neo-Tokyo youth subcultures build offline copper-wire networks and CRT boxes to escape retina-tracking advertisements.'
            }
        )
        if created:
            art4.tags.add(tags_dict['Cyberpunk'])

        # 5. Create Comments
        self.stdout.write('- Creating comments...')
        c1, _ = Comment.objects.get_or_create(
            article=art1,
            user=reader1,
            defaults={'body': 'This is simultaneously beautiful and terrifying. Are we ready for this level of machine agency?', 'status': 'approved'}
        )
        Comment.objects.get_or_create(
            article=art1,
            user=journalist2,
            parent=c1,
            defaults={'body': 'Highly doubt it. The Geneva team has already received cease-and-desist warnings from three different security unions.', 'status': 'approved'}
        )

        # 6. Create AdSlots
        self.stdout.write('- Creating ad slots...')
        ad_start = timezone.now() - datetime.timedelta(days=10)
        ad_end = timezone.now() + datetime.timedelta(days=90)
        
        # Header Leaderboard
        AdSlot.objects.get_or_create(
            placement='header-banner',
            defaults={
                'name': 'OmniCorp Quantum Core Campaign',
                'target_url': 'https://omnicorp.net/quantum',
                'start_date': ad_start,
                'end_date': ad_end,
                'priority': 10,
                'html_content': '<div class="w-full h-full flex items-center justify-center bg-blue-deep/20 border border-blue/40 text-blue font-mono text-sm uppercase p-4 glass-panel">ADVERTISEMENT: UPGRADE TO OMNICORP NEURAL GRID CORE v12.1</div>',
                'is_active': True
            }
        )
        
        # Sidebar Rail
        AdSlot.objects.get_or_create(
            placement='sidebar-rail',
            defaults={
                'name': 'Martian Orbital Travel Agency',
                'target_url': 'https://orbitmars.com/tickets',
                'start_date': ad_start,
                'end_date': ad_end,
                'priority': 5,
                'html_content': '<div class="w-full h-[600px] flex flex-col items-center justify-center bg-charcoal border border-white/10 text-gray-400 font-sans text-center p-6 glass-panel"><div class="text-xl text-white font-bold mb-4">LEAVE EARTH BEHIND</div><p class="text-sm mb-6">Flights from Kennedy Launchpad to Ares Station start at 45,000 credits. Reserve your sleeper pod today.</p><div class="px-4 py-2 bg-blue text-white rounded font-bold hover:bg-blue-glow transition-all">BOOK NOW</div></div>',
                'is_active': True
            }
        )

        # In-Feed Native
        infeed_ad, _ = AdSlot.objects.get_or_create(
            placement='in-feed-native',
            defaults={
                'name': 'Apex Cyber-Enhance Goggles',
                'target_url': 'https://apexoptics.cyber',
                'start_date': ad_start,
                'end_date': ad_end,
                'priority': 8,
                'html_content': '<div class="glass-panel border-blue/30 p-6 rounded-lg flex flex-col justify-between h-full"><span class="text-xs text-blue-glow uppercase tracking-wider font-mono">Sponsored</span><h3 class="text-lg font-bold text-white mt-2">APEX HUD Goggles: Overhaul Your Reality</h3><p class="text-sm text-gray-400 mt-2 mb-4">Realtime vector pathing, thermal filters, and facial database overlay. Now 15% off.</p><a href="https://apexoptics.cyber" class="text-blue text-sm hover:underline mt-auto">Upgrade Optics →</a></div>',
                'is_active': True
            }
        )

        # 7. Create HomepageLayout Sections
        self.stdout.write('- Creating homepage layout configuration...')
        HomepageLayout.objects.get_or_create(order=0, defaults={'section_type': 'hero', 'is_visible': True})
        HomepageLayout.objects.get_or_create(order=1, defaults={'section_type': 'featured-grid', 'is_visible': True})
        HomepageLayout.objects.get_or_create(order=2, defaults={'section_type': 'category-rail', 'category': tech_cat, 'is_visible': True})
        HomepageLayout.objects.get_or_create(order=3, defaults={'section_type': 'ad-slot', 'ad_slot': infeed_ad, 'is_visible': True})
        HomepageLayout.objects.get_or_create(order=4, defaults={'section_type': 'category-rail', 'category': space_cat, 'is_visible': True})
        HomepageLayout.objects.get_or_create(order=5, defaults={'section_type': 'trending-widget', 'is_visible': True})

        # 8. Create SiteSettings
        self.stdout.write('- Creating site settings singleton...')
        SiteSetting.objects.get_or_create(
            id=1,
            defaults={
                'site_name': 'THE PULSE',
                'primary_color': '#2F6DF6',
                'footer_text': '© 2026 THE PULSE. Glassmorphic Editorial Networks. Built for high-frequency readers.'
            }
        )

        # 9. Create Newsletter subscribers
        self.stdout.write('- Subscribing default emails...')
        Subscriber.objects.get_or_create(email='reader_jane@gmail.com')
        Subscriber.objects.get_or_create(email='future_fan@outlook.com')

        self.stdout.write(self.style.SUCCESS('Database successfully seeded!'))
