from django.conf import settings
# Import settings from django.conf to reference the custom User model securely.
from django.db import models
# Import models module to define our database table structures.
from django.core.validators import MinValueValidator, MaxValueValidator
# Import validators to restrict integer inputs between a minimum and maximum range.

class Item(models.Model):
    """
    ITEM MODEL
    
    Analogy:
    Think of the Item model like a product listing page in an online store's catalog.
    It contains all the physical specs of a tech gadget—its name, brand, category,
    description, how much it costs, and a link to its display picture.
    """
    
    # name: A text field that holds the product's name (e.g., "Sony WH-1000XM5").
    name = models.CharField(max_length=255)
    
    # brand: A text field that holds the manufacturer's name (e.g., "Sony").
    brand = models.CharField(max_length=100)
    
    # category: A text field representing the product type (e.g., "Headphones", "Laptops", "Cameras").
    category = models.CharField(max_length=100)
    
    # description: A longer text block storing detailed descriptions of the item.
    description = models.TextField()
    
    # image_url: A link pointing to the product's display image hosted online.
    # We set blank=True and default='' so that it's optional.
    image_url = models.URLField(max_length=500, blank=True, default='')
    
    # price: A decimal number field representing retail price.
    # max_digits=10 allow values up to $99,999,999.99, and decimal_places=2 ensures two digits after the decimal point.
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # created_at: A timestamp recording exactly when the item was inserted into the database.
    # auto_now_add=True sets this field automatically when the item is first created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Returns a human-readable representation of this model.
        When Django needs to print an Item, it will display its name.
        """
        return self.name


class Review(models.Model):
    """
    REVIEW MODEL
    
    Analogy:
    Think of the Review model like an entry in a guestbook for a specific gadget.
    It links:
    - item: A connection to the specific gadget being reviewed.
    - author: A connection to the specific user who wrote the review.
    - rating: A star rating value between 1 and 5.
    - body: The text of the review.
    - upvotes: A registry of all users who found this review helpful.
    """
    
    # item: Connects this review to one specific Item gadget card.
    # If the gadget is deleted (on_delete=models.CASCADE), all of its reviews are deleted too.
    # related_name='reviews' lets us easily query `item.reviews.all()`.
    item = models.ForeignKey(
        Item, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    
    # author: Connects this review to the User who wrote it.
    # settings.AUTH_USER_MODEL dynamically references the user model configured in settings.py.
    # If the user is deleted, their reviews are also deleted.
    # related_name='reviews' lets us query `user.reviews.all()`.
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    
    # rating: An integer/number field that must be between 1 and 5.
    # We apply MinValueValidator(1) and MaxValueValidator(5) to enforce this range.
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1), 
            MaxValueValidator(5)
        ]
    )
    
    # body: The detailed text describing the reviewer's opinion.
    body = models.TextField()
    
    # upvotes: A Many-to-Many connection linking the review to multiple Users who voted it helpful.
    # Since a user can vote on many reviews, and a review can have votes from many users, this is a Many-to-Many relationship.
    # blank=True means reviews start with zero votes.
    # related_name='upvoted_reviews' allows us to query `user.upvoted_reviews.all()`.
    upvotes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        blank=True, 
        related_name='upvoted_reviews'
    )
    
    # created_at: A timestamp recording when the review was posted.
    # auto_now_add=True automatically captures the date and time of creation.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Returns a human-readable representation of this review.
        """
        return f"Review by {self.author.email} on {self.item.name}"
