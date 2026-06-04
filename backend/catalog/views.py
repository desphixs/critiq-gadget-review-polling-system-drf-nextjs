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
from .serializers import ItemSerializer, ReviewSerializer, ReviewCreateSerializer
# Import our serializers to translate and validate model data formats.

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


class ReviewCreateView(APIView):
    """
    REVIEW CREATE VIEW
    
    Analogy:
    Think of this class like a security guard at a feedback box.
    When a customer tries to submit a comment card:
    1. The guard checks if the product/item actually exists. If not, they reject the card (404 Not Found).
    2. The guard checks a registry list to see if this customer has already written a comment card 
       for this exact product. If they did, they reject the card to prevent spam (400 Bad Request).
    3. The guard checks if the comment card's content is valid (has a star score of 1-5, and has a
       review text that is long enough).
    4. If all checks pass, the guard logs the comment in the database (201 Created).
    """
    
    # permission_classes: Restricts access to authenticated users only.
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        """
        Handles incoming HTTP POST requests to submit a review for a specific item.
        """
        # 1. Verify that the target Item gadget actually exists in our database.
        item = Item.objects.filter(id=item_id).first()
        if item is None:
            # Return an HTTP 404 response if the item cannot be found.
            return Response({'error': 'Item not found'}, status=404)

        # 2. Enforce the business rule: One review per user, per item.
        # We query the database to check if a Review already exists with this item_id and author.
        already_reviewed = Review.objects.filter(item_id=item_id, author=request.user).exists()
        if already_reviewed:
            # Return an HTTP 400 Bad Request response with a descriptive error message.
            return Response({'error': 'You have already reviewed this item.'}, status=400)

        # 3. Instantiate the serializer with the incoming JSON payload (request.data).
        serializer = ReviewCreateSerializer(data=request.data)
        
        # 4. Run the validation checks (e.g. checking field lengths and range constraints).
        # raise_exception=True will automatically halt execution and return a 400 Bad Request
        # response with the validation error details if the client sends invalid inputs.
        serializer.is_valid(raise_exception=True)

        # 5. Insert the new Review record directly into the database.
        # We access the safe, checked data from `serializer.validated_data`.
        Review.objects.create(
            item_id=item_id,
            author=request.user,
            rating=serializer.validated_data['rating'],
            body=serializer.validated_data['body']
        )

        # 6. Return a success response with an HTTP 201 Created status.
        return Response({'message': 'Review submitted successfully.'}, status=201)


class ToggleUpvoteView(APIView):
    """
    TOGGLE UPVOTE VIEW
    
    Analogy:
    Think of this class like a light switch or a classroom attendance toggle button.
    When an authenticated student enters the room and clicks the switch:
    - If the light was off (user has not upvoted this review yet), we flip it on (add them to the upvotes set).
    - If the light was already on (user already upvoted this review), we flip it off (remove them from the upvotes set).
    Finally, we count how many people have their lights on and report that number back to the room.
    """
    
    # permission_classes: Enforce that only logged-in users can cast or retract helpful votes.
    permission_classes = [IsAuthenticated]

    def post(self, request, review_id):
        """
        Handles incoming HTTP POST requests to toggle the upvote status of a review.
        """
        # 1. Fetch the Review from the database.
        # We query by id=review_id to find the target review card.
        review = Review.objects.filter(id=review_id).first()
        if review is None:
            # If the review doesn't exist, return a 404 Not Found response.
            return Response({'error': 'Review not found'}, status=404)

        # 2. Get the requesting user who sent the API call.
        user = request.user

        # 3. Toggle logic: Check if the user has already upvoted this review.
        # We check membership: is the user object inside our review's upvotes Many-to-Many set?
        if user in review.upvotes.all():
            # If the condition is True, the user already voted for it.
            # So, we retract/remove their upvote from the Many-to-Many relationship.
            review.upvotes.remove(user)
            # Set the voted status flag to False since their vote is now removed.
            voted = False
        else:
            # If the condition is False, the user hasn't voted for this review yet.
            # So, we register/add their upvote to the Many-to-Many relationship.
            review.upvotes.add(user)
            # Set the voted status flag to True since their vote is now recorded.
            voted = True

        # 4. Count the new total number of upvotes for this review.
        # .count() executes a fast SQL COUNT query at the database level.
        new_count = review.upvotes.count()

        # 5. Return the result dictionary back to the client with a 200 OK status.
        # This payload tells the frontend exactly what visual state (voted: True/False) and
        # what vote count (upvote_count) to display without needing to re-fetch the entire page.
        return Response({
            'voted': voted,
            'upvote_count': new_count
        }, status=200)

