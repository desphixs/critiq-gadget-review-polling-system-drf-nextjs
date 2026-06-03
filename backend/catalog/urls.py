from django.urls import path
# Import the path function from django.urls to define URL routes.
from .views import ItemListView
# Import our ItemListView class to link it to the URL route.

# urlpatterns: A list mapping URL paths to view classes.
urlpatterns = [
    # path('items/', ...): Maps GET requests targeting 'api/catalog/items/' to our ItemListView.
    # .as_view() is required because Django needs to translate our class-based view into a callable function.
    path('items/', ItemListView.as_view(), name='item-list'),
]
