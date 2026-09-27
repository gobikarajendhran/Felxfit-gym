from datetime import time, date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from gym.models import (Program, Trainer, TrainerAvailability, MembershipPlan,
                         GymClass, ClassSchedule)
from testimonials.models import Testimonial

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with realistic demo data for FlexFit Gym.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        # --- Admin & demo customer accounts ---
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@flexfit.com', 'Admin@1234')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / Admin@1234'))

        if not User.objects.filter(username='demo_member').exists():
            demo = User.objects.create_user('demo_member', 'member@flexfit.com', 'Member@1234',
                                             first_name='Riya', last_name='Sharma',
                                             phone='9876543210', is_member=True)
            self.stdout.write(self.style.SUCCESS('Created demo customer: demo_member / Member@1234'))

        # --- Programs ---
        programs_data = [
            ('Strength Training', 'strength-training', 'dumbbell',
             'Build raw power and muscle with progressive resistance training tailored to your level.', 8),
            ('Weight Loss', 'weight-loss', 'flame',
             'A combined cardio + nutrition guided program to help you burn fat sustainably.', 12),
            ('Yoga & Flexibility', 'yoga-flexibility', 'leaf',
             'Improve mobility, balance and mental clarity through guided yoga sessions.', 6),
            ('CrossFit', 'crossfit', 'zap',
             'High-intensity functional training that builds strength, speed and endurance.', 10),
            ('Bodybuilding', 'bodybuilding', 'trophy',
             'Structured hypertrophy program for serious muscle growth.', 16),
            ('Cardio & HIIT', 'cardio-hiit', 'heart-pulse',
             'Torch calories fast with high-intensity interval training circuits.', 8),
        ]
        programs = {}
        for name, slug, icon, desc, weeks in programs_data:
            p, _ = Program.objects.update_or_create(
                slug=slug, defaults=dict(name=name, icon=icon, description=desc, duration_weeks=weeks))
            programs[slug] = p

        # --- Trainers ---
        trainers_data = [
            ('Arjun Mehta', 'arjun-mehta', 'Strength & Conditioning', 8, 4.9,
             'Certified strength coach specializing in powerlifting and progressive overload programs.',
             ['strength-training', 'bodybuilding']),
            ('Sneha Kapoor', 'sneha-kapoor', 'Yoga & Mobility', 6, 4.8,
             'RYT-500 certified yoga instructor focused on flexibility, breathwork and recovery.',
             ['yoga-flexibility']),
            ('Vikram Rao', 'vikram-rao', 'CrossFit & HIIT', 10, 5.0,
             'Former national-level athlete coaching functional fitness and conditioning.',
             ['crossfit', 'cardio-hiit']),
            ('Ananya Iyer', 'ananya-iyer', 'Weight Loss & Nutrition', 5, 4.7,
             'Nutrition-first weight loss coach helping members build sustainable habits.',
             ['weight-loss', 'cardio-hiit']),
        ]
        trainers = {}
        for name, slug, spec, exp, rating, bio, prog_slugs in trainers_data:
            t, _ = Trainer.objects.update_or_create(
                slug=slug, defaults=dict(name=name, specialization=spec, experience_years=exp,
                                          rating=rating, bio=bio))
            t.programs.set([programs[s] for s in prog_slugs])
            trainers[slug] = t
            TrainerAvailability.objects.get_or_create(
                trainer=t, day_of_week=0, defaults=dict(start_time=time(6, 0), end_time=time(20, 0)))
            TrainerAvailability.objects.get_or_create(
                trainer=t, day_of_week=2, defaults=dict(start_time=time(6, 0), end_time=time(20, 0)))
            TrainerAvailability.objects.get_or_create(
                trainer=t, day_of_week=4, defaults=dict(start_time=time(6, 0), end_time=time(20, 0)))

        # --- Membership plans ---
        plans_data = [
            ('Monthly Plan', 'monthly', 1999, 30,
             ['Full gym access', 'Locker room access', 'Free BMI assessment'], False),
            ('Quarterly Plan', 'quarterly', 5499, 90,
             ['Full gym access', 'Locker room access', '1 free trainer session', 'Diet consultation'], True),
            ('Yearly Plan', 'yearly', 18999, 365,
             ['Full gym access', 'All classes included', '4 free trainer sessions',
              'Priority booking', 'Free merchandise kit'], False),
            ('Personal Training', 'personal_training', 8999, 30,
             ['1-on-1 personal trainer', 'Customized workout plan', 'Nutrition guidance',
              'Progress tracking'], False),
        ]
        for name, ptype, price, days, features, popular in plans_data:
            MembershipPlan.objects.update_or_create(
                plan_type=ptype, defaults=dict(name=name, price=price, duration_days=days,
                                                features=features, is_popular=popular))

        # --- Classes & schedules ---
        classes_data = [
            ('Power Yoga', 'power-yoga', 'sneha-kapoor', 25, 60,
             [(0, time(7, 0), time(8, 0)), (3, time(7, 0), time(8, 0))]),
            ('CrossFit Bootcamp', 'crossfit-bootcamp', 'vikram-rao', 20, 50,
             [(1, time(18, 0), time(18, 50)), (4, time(18, 0), time(18, 50))]),
            ('HIIT Blast', 'hiit-blast', 'ananya-iyer', 20, 45,
             [(2, time(19, 0), time(19, 45)), (5, time(9, 0), time(9, 45))]),
            ('Strength Fundamentals', 'strength-fundamentals', 'arjun-mehta', 15, 60,
             [(0, time(17, 0), time(18, 0)), (5, time(10, 0), time(11, 0))]),
        ]
        for name, slug, trainer_slug, cap, dur, schedules in classes_data:
            c, _ = GymClass.objects.update_or_create(
                slug=slug, defaults=dict(name=name, trainer=trainers[trainer_slug],
                                          capacity=cap, duration_minutes=dur,
                                          description=f'{name} led by {trainers[trainer_slug].name}.'))
            for day, start, end in schedules:
                ClassSchedule.objects.get_or_create(gym_class=c, day_of_week=day, start_time=start,
                                                      defaults=dict(end_time=end))

        # --- Testimonials ---
        testimonials_data = [
            ('Karthik Subramaniam', 'Member since 2022',
             'FlexFit completely changed my fitness journey. Lost 12kg in 6 months with Ananya\'s guidance!', 5),
            ('Priya Nair', 'Member since 2023',
             'The trainers are extremely knowledgeable and the app makes booking classes effortless.', 5),
            ('Rahul Verma', 'Member since 2021',
             'Best CrossFit sessions in the city. Vikram pushes you to your limits safely.', 4),
            ('Divya Menon', 'Member since 2023',
             'Loved the yoga classes with Sneha - great for stress relief after work.', 5),
        ]
        for name, role, msg, rating in testimonials_data:
            Testimonial.objects.get_or_create(name=name, defaults=dict(role=role, message=msg, rating=rating))

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('Admin login: admin / Admin@1234'))
        self.stdout.write(self.style.SUCCESS('Demo customer login: demo_member / Member@1234'))
