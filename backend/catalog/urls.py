from django.urls import path
# Import the path function from django.urls to define URL routes.
from .views import ItemListView, ReviewListView, ReviewCreateView
# Import our view classes to link them to URL routes.

# urlpatterns: A list mapping URL paths to view classes.
urlpatterns = [
    # path('items/', ...): Maps GET requests targeting 'api/catalog/items/' to our ItemListView.
    # .as_view() is required because Django needs to translate our class-based view into a callable function.
    path('items/', ItemListView.as_view(), name='item-list'),
    
    # path('items/<int:item_id>/reviews/', ...): Maps GET requests targeting 'api/catalog/items/<item_id>/reviews/'
    # to our ReviewListView. <int:item_id> captures the item ID from the URL and passes it as a parameter to the view.
    path('items/<int:item_id>/reviews/', ReviewListView.as_view(), name='review-list'),
    
    # path('items/<int:item_id>/reviews/create/', ...): Maps POST requests targeting 'api/catalog/items/<item_id>/reviews/create/'
    # to our ReviewCreateView. This captures the item ID and handles review submissions.
    path('items/<int:item_id>/reviews/create/', ReviewCreateView.as_view(), name='review-create'),
]
