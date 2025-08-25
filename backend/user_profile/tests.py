from django.test import TestCase
from django.contrib.auth.models import User
from user_profile.models import UserProfile

class UserProfileModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Create a profile for the test user
        self.test_profile = UserProfile.objects.create(
            user=self.test_user,
            bio='Test bio',
            address='Test address'
        )
    
    def test_profile_creation(self):
        """Test that a profile can be created for a user"""
        self.assertEqual(self.test_profile.user, self.test_user)
        self.assertEqual(self.test_profile.bio, 'Test bio')
        self.assertEqual(self.test_profile.address, 'Test address')
    
    def test_profile_str_method(self):
        """Test the string representation of a profile"""
        expected_str = "testuser's profile"
        self.assertEqual(str(self.test_profile), expected_str)
    
    def test_profile_creation_with_defaults(self):
        """Test that a profile can be created with default values"""
        user = User.objects.create_user(
            username='defaultuser',
            email='default@example.com',
            password='defaultpassword123'
        )
        profile = UserProfile.objects.create(user=user)
        self.assertEqual(profile.bio, None)
        self.assertEqual(profile.address, None)

class UserProfileSignalTest(TestCase):
    def test_profile_auto_creation(self):
        """Test that a profile is automatically created when a user is created"""
        user = User.objects.create_user(
            username='signaluser',
            email='signal@example.com',
            password='signalpassword123'
        )
        
        # Check that a profile was automatically created
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.role, 'patient')  # Default role
