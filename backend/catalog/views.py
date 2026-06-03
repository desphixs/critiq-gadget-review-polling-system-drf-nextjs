from rest_framework.views import APIView
# Import APIView from rest_framework to build class-based API endpoints.
from rest_framework.response import Response
# Import Response from rest_framework to return serialized JSON data to the browser.
from rest_framework.permissions import IsAuthenticated
# Import IsAuthenticated to enforce authentication rules for this API endpoint.
from django.db.models import Avg, Count
# Import Avg (Average) and Count aggregation utilities to calculate review stats directly in database queries.

from .models import Item
# Import our Item model to query the tech gadgets table.
from .serializers import ItemSerializer
# Import our ItemSerializer to translate the model records into JSON strings.

class ItemListView(APIView):
    """
    ITEM LIST VIEW
    
    Analogy:
    Think of this class like a clerk at a library counter.
    When a registered member (authenticated user) asks for the catalog list,
    the clerk doesn't just hand over the cards. They calculate the average popularity rating
    and total reviews for each book, write those numbers down on the card, and return the list.
    """
    
    # permission_classes: Restricts access to this endpoint to logged-in users only.
    # Guests who do not provide a valid JWT security token will receive a 401 Unauthorized block.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handles incoming HTTP GET requests to retrieve the list of gadgets.
        """
        # 1. Query the database for all items.
        # .annotate() allows us to calculate fields on the fly and attach them as virtual attributes.
        # avg_rating=Avg('reviews__rating') gets the average star rating from all related reviews.
        # review_count=Count('reviews') counts the total reviews connected to the item.
        queryset = Item.objects.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        )

        # 2. Translate the Python objects (with the annotations) into JSON format.
        # many=True tells the serializer that we are translating a list of objects, not a single one.
        serializer = ItemSerializer(queryset, many=True)

        # 3. Return the JSON payload to the frontend.
        # Response automatically wraps the translated dictionary data in a standard HTTP response.
        return Response(serializer.data)
