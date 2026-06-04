from rest_framework.views import APIView
# Import APIView from rest_framework to build class-based API endpoints.
from rest_framework.response import Response
# Import Response from rest_framework to return serialized JSON data to the browser.
from rest_framework.permissions import IsAuthenticated
# Import IsAuthenticated to enforce authentication rules for this API endpoint.
from django.db.models import Avg, Count
# Import Avg (Average) and Count aggregation utilities to calculate review stats directly in database queries.

from .models import Item, Review
# Import our Item and Review models to query their database tables.
from .serializers import ItemSerializer, ReviewSerializer
# Import our ItemSerializer and ReviewSerializer to translate model data into JSON format.

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


class ReviewListView(APIView):
    """
    REVIEW LIST VIEW
    
    Analogy:
    Think of this class like a bulletin board helper. 
    When an authenticated user requests to see the reviews for a specific item (identified by its item_id),
    the helper first checks if the item actually exists. If it does, they retrieve all comments (reviews)
    written for that item. Since users want to see who wrote the review (with their avatar) and if they 
    personally have already marked it as helpful (voted), the helper pre-compiles these details onto
    each review card before sending the stack back to the user.
    """
    
    # permission_classes: Limits access to logged-in users only.
    permission_classes = [IsAuthenticated]

    def get(self, request, item_id):
        """
        Handles incoming GET requests to fetch all reviews for a specific item.
        """
        # 1. Look up the item in the database.
        # We use .filter(id=item_id).first() to find the item. If it doesn't exist, it returns None.
        item = Item.objects.filter(id=item_id).first()
        if item is None:
            # If the item does not exist, return a 404 Not Found error with a descriptive message.
            return Response({'error': 'Item not found'}, status=404)

        # 2. Retrieve all reviews associated with the specified item.
        # We use select_related('author', 'author__profile') to fetch the author and profile information
        # in the same database query. This avoids the "N+1 query problem", which occurs when Django has 
        # to send a separate database query for every single review's author profile details.
        # We use prefetch_related('upvotes') because upvotes is a Many-to-Many field and is fetched efficiently
        # in a separate batch query.
        reviews = Review.objects.filter(item_id=item_id).select_related(
            'author', 
            'author__profile'
        ).prefetch_related('upvotes')

        # 3. Manually construct a list of review dictionaries.
        # This gives us explicit control to calculate custom fields like upvote_count and has_voted,
        # which are not stored directly as static columns in the Review table.
        serialized_reviews_data = []
        for review in reviews:
            # Check if the user who is calling this API endpoint has already upvoted this specific review.
            # `review.upvotes.all()` returns a list of all users who upvoted it.
            # We search for `request.user` in this list. This returns True or False.
            has_voted = request.user in review.upvotes.all()

            # Find the display name of the reviewer. 
            # If the user has set their full_name, we use it; otherwise, we default to their email address.
            author_name = review.author.full_name or review.author.email

            # Retrieve the reviewer's avatar image URL from their profile.
            author_avatar = review.author.profile.avatar

            # Count how many total users have upvoted this review.
            upvote_count = review.upvotes.count()

            # Assemble all of the fields into a plain dictionary representing the review card.
            review_dict = {
                'id': review.id,
                'rating': review.rating,
                'body': review.body,
                # Convert the datetime object to a standard ISO-8601 string format (e.g. "2026-06-04T01:00:00Z").
                'created_at': review.created_at.isoformat(),
                'upvote_count': upvote_count,
                'has_voted': has_voted,
                'author_name': author_name,
                'author_avatar': author_avatar,
            }
            serialized_reviews_data.append(review_dict)

        # 4. Use the serializer to validate and translate the Python dictionary list into JSON format.
        # We pass many=True because we are serializing a list of multiple review dictionaries.
        serializer = ReviewSerializer(serialized_reviews_data, many=True)

        # 5. Return the serialized data back to the client with an HTTP 200 OK status.
        return Response(serializer.data, status=200)

