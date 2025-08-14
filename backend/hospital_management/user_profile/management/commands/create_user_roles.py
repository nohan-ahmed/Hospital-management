from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from user_profile.models import UserProfile
from django.db import transaction

class Command(BaseCommand):
    help = 'Creates initial users with different roles for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input', 
            action='store_true', 
            help='Skip confirmation prompt'
        )

    def handle(self, *args, **options):
        # Define test users with different roles
        test_users = [
            {
                'username': 'admin_user',
                'email': 'admin@example.com',
                'password': 'adminpassword123',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
                'role': 'admin'
            },
            {
                'username': 'doctor_user',
                'email': 'doctor@example.com',
                'password': 'doctorpassword123',
                'first_name': 'Doctor',
                'last_name': 'User',
                'is_staff': False,
                'is_superuser': False,
                'role': 'doctor'
            },
            {
                'username': 'patient_user',
                'email': 'patient@example.com',
                'password': 'patientpassword123',
                'first_name': 'Patient',
                'last_name': 'User',
                'is_staff': False,
                'is_superuser': False,
                'role': 'patient'
            },
            {
                'username': 'staff_user',
                'email': 'staff@example.com',
                'password': 'staffpassword123',
                'first_name': 'Staff',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': False,
                'role': 'staff'
            },
        ]

        if not options['no_input']:
            self.stdout.write(
                self.style.WARNING(
                    'This will create test users with predefined passwords. '
                    'Do not use in production environments.\n'
                    'Are you sure you want to continue? (y/N)'
                )
            )
            response = input()
            if response.lower() != 'y':
                self.stdout.write(self.style.ERROR('User creation cancelled.'))
                return

        # Create users with transaction to ensure atomicity
        with transaction.atomic():
            created_count = 0
            skipped_count = 0

            for user_data in test_users:
                role = user_data.pop('role')
                username = user_data['username']

                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    self.stdout.write(self.style.WARNING(f'User {username} already exists. Skipping.'))
                    skipped_count += 1
                    continue

                # Create user
                user = User.objects.create_user(**user_data)
                
                # Create or update profile
                UserProfile.objects.update_or_create(
                    user=user,
                    defaults={'role': role}
                )
                
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created user: {username} with role: {role}'))

            # Summary
            self.stdout.write(self.style.SUCCESS(f'Created {created_count} users, skipped {skipped_count} existing users.'))