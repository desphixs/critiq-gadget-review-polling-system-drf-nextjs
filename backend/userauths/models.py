from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    """
    CUSTOM USER MANAGER
    
    Analogy:
    Think of this class like a clerk at the passport office. 
    Whenever a new citizen wants to register, the clerk double-checks if their data is complete,
    standardizes their email structure (normalization), and makes sure their security password
    is scrambled safely before sealing the records in the filing cabinet (the database).
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Creates, hashes the password, and saves a standard user account.
        """
        # We enforce that every user must provide an email address.
        if not email:
            raise ValueError('Users must provide an email address')
        
        # We "normalize" the email domain name (e.g., converting "Destiny@Gmail.Com" to lowercase).
        # This prevents duplicate account registrations due to case adjustments.
        email = self.normalize_email(email)
        
        # Instantiate the model with the normalized email and extra details.
        user = self.model(email=email, **extra_fields)
        
        # We securely hash/scramble the password before saving it.
        # This keeps the raw password safe from database breaches!
        user.set_password(password)
        
        # Save the finalized user object directly to the database.
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates, hashes, and saves an administrative superuser account.
        """
        # We set default flags since this is an admin administrator.
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        # Validate that the superuser possesses permissions access.
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # Call our standard create_user method above to generate the database row.
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    CUSTOM USER MODEL
    
    Analogy:
    This model defines the layout of the filing card for every user in our library database.
    Instead of using standard old-fashioned user cards that rely on usernames, we design a modern card 
    layout that uses a unique Email address as the primary identifier (USERNAME_FIELD).
    """
    
    # Primary email address that must be unique across the entire database.
    email = models.EmailField(unique=True, max_length=255)
    
    # Optional field to store the user's full name.
    full_name = models.CharField(max_length=255, blank=True)
    
    # Active toggle indicator. Useful for suspending accounts or soft deletions.
    is_active = models.BooleanField(default=True)
    
    # Staff indicator. Determines if this user is allowed to access the admin portal interface.
    is_staff = models.BooleanField(default=False)
    
    # Timestamps that record exactly when an account was born and last modified.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Attach our custom manager clerk to this model so Django knows how to create users.
    objects = UserManager()

    # We map the email field as the primary username column.
    USERNAME_FIELD = 'email'
    
    # We require no additional fields during basic generation (e.g. createsuperuser).
    REQUIRED_FIELDS = []

    def __str__(self):
        """
        Returns a friendly representation string whenever the object is printed.
        """
        return self.email


class UsedToken(models.Model):
    """
    Tracks consumed cryptographic signatures to prevent replay attacks (token reuse).
    Since TimestampSigner tokens are stateless, storing used ones until their natural
    expiration is a standard security practice to prevent replay attacks.
    """
    token = models.CharField(max_length=500, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Used: {self.token[:30]}..."


class UserOTP(models.Model):
    """
    USER ONE-TIME PASSWORD (OTP) MODEL
    
    Analogy:
    Think of this model like a temporary gate pass issued to a visitor.
    It contains:
    - user: A link to the registered user profile in our database.
    - code: The secret numeric code, hashed/encrypted so that if our database is ever
            compromised, the raw digits cannot be read!
    - expires_at: A self-destruct timer set exactly 5 minutes out from generation.
    - attempts: A counter recording how many failed attempts have been made. If someone guesses incorrectly
                3 consecutive times, the pass is instantly deleted!
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=255)  # Scrambled/hashed 6-digit numeric code
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.user.email} (Expires: {self.expires_at})"


class Profile(models.Model):
    """
    USER PROFILE MODEL
    
    Analogy:
    Think of this model like the extended info section on a membership card.
    The primary User card stores core credentials (email and full name).
    This Profile card stores additional details like bio, avatar picture URL,
    and user settings preferences (email notifications, public profile options).
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    avatar = models.URLField(max_length=500, blank=True, default='')
    email_notification = models.BooleanField(default=True)
    public_profile = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email}"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal receiver to automatically create a Profile instance
    whenever a new User is registered.
    """
    if created:
        Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal receiver to save the associated Profile instance
    whenever the User is updated.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()

