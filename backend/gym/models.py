from django.conf import settings
from django.db import models


class Program(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='dumbbell')  # icon key used by frontend
    image = models.ImageField(upload_to='programs/', blank=True, null=True)
    duration_weeks = models.PositiveIntegerField(default=8)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Trainer(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    specialization = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    experience_years = models.PositiveIntegerField(default=1)
    photo = models.ImageField(upload_to='trainers/', blank=True, null=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    is_active = models.BooleanField(default=True)
    programs = models.ManyToManyField(Program, related_name='trainers', blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class TrainerAvailability(models.Model):
    DAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.trainer.name} - {self.get_day_of_week_display()}"


class Appointment(models.Model):
    STATUS = [('pending', 'Pending'), ('confirmed', 'Confirmed'),
               ('completed', 'Completed'), ('cancelled', 'Cancelled')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time_slot = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time_slot']
        unique_together = ['trainer', 'date', 'time_slot']

    def __str__(self):
        return f"{self.user.username} with {self.trainer.name} on {self.date} {self.time_slot}"


class MembershipPlan(models.Model):
    PLAN_TYPES = [
        ('monthly', 'Monthly'), ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'), ('personal_training', 'Personal Training'),
    ]
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    features = models.JSONField(default=list)  # list of feature strings
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return self.name


class Membership(models.Model):
    STATUS = [('active', 'Active'), ('expired', 'Expired'), ('cancelled', 'Cancelled')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE, related_name='memberships')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"


class GymClass(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, related_name='classes')
    capacity = models.PositiveIntegerField(default=20)
    duration_minutes = models.PositiveIntegerField(default=60)
    image = models.ImageField(upload_to='classes/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ClassSchedule(models.Model):
    DAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    gym_class = models.ForeignKey(GymClass, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.gym_class.name} - {self.get_day_of_week_display()} {self.start_time}"

    @property
    def available_slots(self):
        booked = self.bookings.filter(status__in=['pending', 'confirmed']).count()
        return max(self.gym_class.capacity - booked, 0)


class ClassBooking(models.Model):
    STATUS = [('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_bookings')
    schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'schedule', 'booking_date']

    def __str__(self):
        return f"{self.user.username} - {self.schedule}"
