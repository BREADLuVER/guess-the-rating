# backend/game_prediction/serializers.py

from rest_framework import serializers
from .models import Game, Prediction, Comment
from django.contrib.auth.models import User

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title']


class PredictionSerializer(serializers.ModelSerializer):
    user = serializers.CharField()
    game = serializers.CharField(required=False)
    journalist = serializers.CharField(required=False)
    predicted_rating = serializers.IntegerField(required=False)

    class Meta:
        model = Prediction
        fields = ['id', 'user', 'game', 'journalist', 'predicted_rating', 'submitted_at']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'game', 'content', 'created_at', 'parent']


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user