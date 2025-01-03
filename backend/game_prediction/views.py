# backend/game_prediction/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from .models import Game, Prediction, Comment, ScrapedGame, GameClick
from .serializers import GameSerializer, PredictionSerializer, CommentSerializer, UserRegistrationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from google.oauth2 import id_token
from google.auth.transport import requests
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from django.db import models
from django.db.models import Q, Count
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse
import logging
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

logger = logging.getLogger(__name__)

@api_view(['POST'])
def google_login(request):
    token = request.data.get('id_token')

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), "YOUR_GOOGLE_CLIENT_ID")

        google_user_id = idinfo['sub']
        email = idinfo.get('email')
        first_name = idinfo.get('given_name')
        last_name = idinfo.get('family_name')

        user, created = User.objects.get_or_create(username=google_user_id, defaults={
            'first_name': first_name,
            'last_name': last_name,
            'email': email
        })


        return JsonResponse({
            'message': 'User logged in successfully',
            'user_id': user.id,
            'email': user.email,
        })

    except ValueError:
        return JsonResponse({'error': 'Invalid token'}, status=400)


def search_games(request):
    query = request.GET.get('query', '')
    if query:
        # Filter for games containing the query and with no rating ('tbd')
        games = ScrapedGame.objects.filter(Q(title__icontains=query) & Q(score='tbd'))[:5]
        game_list = [{'title': game.title, 'score': game.score} for game in games]
        
        logger.info(f"Games found for query '{query}': {game_list}")
        return JsonResponse(game_list, safe=False)
    
    return JsonResponse({"error": "No query provided."}, status=400)


@api_view(['POST'])
def add_game(request):
    auth_header = request.headers.get('Authorization')
    if auth_header:
        print(f"Received Auth Header: {auth_header}")
    else:
        print("No Auth Header received")

    title = request.data.get('title')
    username = request.data.get('username')

    if not username:
        return Response({'error': 'Username required for adding games.'}, status=400)

    if Game.objects.filter(title__iexact=title).exists():
        return Response({'error': 'Game already exists in the database.'}, status=400)

    if not ScrapedGame.objects.filter(title__iexact=title, score='tbd').exists():
        return Response({'error': 'Game does not exist or already has a rating.'}, status=400)

    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': f'Game added successfully by {username}!'})
    return Response(serializer.errors, status=400)


# Sort games by click_count in descending order
@api_view(['GET'])
@permission_classes([AllowAny])
def game_list(request):
    games = Game.objects.all().order_by('-click_count')
    return render(request, 'game_list.html', {'games': games})


def get_user_ratings(request, game_title, journalist):
    user = request.user

    # Ensure we are using the username or id to match predictions
    predictions = Prediction.objects.filter(game__title=game_title, journalist=journalist)
    user_prediction = predictions.filter(user__username=user.username).first()  # Match by username

    ratings_data = predictions.values('predicted_rating').annotate(count=models.Count('predicted_rating'))

    response_data = {
        'ratings': list(ratings_data),
        'user_submitted': user_prediction is not None,
        'user_rating': user_prediction.predicted_rating if user_prediction else None
    }

    return JsonResponse(response_data)


# List all games
class GameListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Game.objects.all()
    serializer_class = GameSerializer


# Get details for a specific game
class GameDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Game.objects.all()
    serializer_class = GameSerializer


# Allow users to submit their prediction
class CreatePredictionView(generics.CreateAPIView):
    serializer_class = PredictionSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        game_title = self.request.data.get('game', '')
        user = self.request.data.get('user', '')
        journalist = self.request.data.get('journalist', '')

        existing_prediction = Prediction.objects.filter(user=user, game=game_title, journalist=journalist).first()

        if existing_prediction:
            existing_prediction.predicted_rating = self.request.data.get('predicted_rating')
            existing_prediction.save()
            return existing_prediction
        else:
            # Create a new prediction
            return serializer.save(user=user, game=game_title, journalist=journalist)


# Fetch all predictions for the given game and journalist
class AnalystPredictionsView(APIView):
    def get(self, request, game_title, journalist_name):
        username = request.GET.get('username')

        # Check if username is provided
        if not username:
            return JsonResponse({"error": "Username query parameter is required"}, status=400)

        # Log for debugging
        print(f"Received request for game: {game_title}, journalist: {journalist_name}, username: {username}")

        try:
            # Query all predictions for this game and journalist
            predictions = Prediction.objects.filter(game=game_title, journalist=journalist_name)
            print(f"Predictions for game and journalist: {predictions}")

            # Filter for the specific user's prediction by username
            user_prediction = predictions.filter(user=username).first()
            print(f"User Prediction for {username}: {user_prediction}")

            # Get ratings count for the graph
            ratings_count = predictions.values('predicted_rating').annotate(count=Count('predicted_rating'))
            print(f"Ratings Count Data: {list(ratings_count)}")

            # Prepare response data
            response_data = {
                "ratings": list(ratings_count),
                "userRating": user_prediction.predicted_rating if user_prediction else None
            }

            # Log final response data
            print(f"Response Data: {response_data}")
            return JsonResponse(response_data)

        except Exception as e:
            print(f"Error occurred: {e}")
            return JsonResponse({"error": "An error occurred processing your request"}, status=500)
    

@csrf_exempt
def increment_click(request, game_id):
    try:
        game = Game.objects.get(id=game_id)

        # Check if the user is authenticated
        if request.user.is_authenticated:
            game_click, created = GameClick.objects.get_or_create(user=request.user, game=game)
            if not created:
                return JsonResponse({"status": "error", "message": "User has already clicked on this game"}, status=400)
        else:
            clicked_games = request.session.get('clicked_games', [])

            if str(game.id) in clicked_games:
                return JsonResponse({"status": "error", "message": "Anonymous user has already clicked on this game"}, status=400)

            clicked_games.append(str(game.id))
            request.session['clicked_games'] = clicked_games

        game.click_count += 1
        game.save()

        return JsonResponse({"status": "success", "click_count": game.click_count})

    except Game.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Game not found"}, status=404)
    

# View comments for a specific game
class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        game_id = self.kwargs['game_id']
        return Comment.objects.filter(game_id=game_id)


# Submit a comment
class CreateCommentView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Leaderboard view to rank users by prediction accuracy
class LeaderboardView(generics.ListAPIView):
    # We'll define this logic later
    pass


class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            if User.objects.filter(username=serializer.validated_data['username']).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=serializer.validated_data['email']).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSignInView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Retrieve identifier and password
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        if not identifier or not password:
            return Response({'error': 'Both identifier and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine if the identifier is an email or username
        try:
            if '@' in identifier:  # Check for email
                user = User.objects.get(email=identifier)
                username = user.username  # Retrieve username associated with the email
            else:
                username = identifier  # Treat identifier as username
                user = User.objects.get(username=username)  # Verify user exists
        except User.DoesNotExist:
            return Response({'error': 'Invalid username/email or password'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(request, username=username, password=password)
        if user:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Sign-in successful',
                'user_id': user.id,
                'username': user.username,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid username/email or password'}, status=status.HTTP_400_BAD_REQUEST)
        

class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        }, status=200)


class UpdatePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get('oldPassword')
        new_password = request.data.get('newPassword')

        if not check_password(old_password, user.password):
            return Response({'error': 'Old password is incorrect'}, status=400)

        user.password = make_password(new_password)
        user.save()

        return Response({'message': 'Password updated successfully'})
    

@api_view(['POST'])
def send_password_reset_email(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"http://localhost:8000/api/password-reset/confirm/{uid}/{token}/"

        # Send email using Mailtrap
        send_mail(
            'Password Reset Request',
            f'Click the link below to reset your password:\n{reset_url}',
            'noreply@example.com',
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def reset_password_confirm(request, uidb64, token):
    new_password = request.data.get('new_password')

    if not new_password:
        return Response({'error': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        # Set the new password
        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Invalid token or user.'}, status=status.HTTP_400_BAD_REQUEST)