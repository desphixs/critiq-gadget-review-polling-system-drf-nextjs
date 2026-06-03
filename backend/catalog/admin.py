from django.contrib import admin
# Import the admin module from django.contrib to register our models with the Django Admin dashboard.
from .models import Item, Review
# Import our new database models (Item and Review) from the models.py file in the same directory.

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """
    ITEM ADMIN CONFIGURATION
    
    Analogy:
    Think of ItemAdmin like a custom control sheet template for our store managers.
    We tell Django exactly which columns to show in the list view (list_display)
    and what filter buttons to put on the right sidebar (list_filter) to make searching easier.
    """
    
    # list_display: Defines the columns that are visible in the main list view in the admin panel.
    list_display = ['name', 'brand', 'category', 'price', 'created_at']
    
    # list_filter: Adds a filtering sidebar on the right to filter items by category or brand.
    list_filter = ['category', 'brand']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    REVIEW ADMIN CONFIGURATION
    
    Analogy:
    Think of ReviewAdmin like a filter sheet for user opinions.
    Administrators can quickly view who authored each review, which item it's for,
    what score/rating was given, and filter reviews to find negative ratings quickly.
    """
    
    # list_display: Tells the admin list page to show columns for item, author, rating, and creation date.
    list_display = ['item', 'author', 'rating', 'created_at']
    
    # list_filter: Allows filtering reviews by star rating or specific items in the catalog.
    list_filter = ['rating', 'item']
