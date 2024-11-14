"""
URL configuration for guess_the_rating project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# backend/guess_the_rating/urls.py

from django.contrib import admin
from django.urls import path, include
from game_prediction import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('game_prediction.urls')),
    path('api/auth/google/', views.google_login, name='google-login'),
    path('api/add-game/', views.add_game, name='add-game'),
    path('predictions/', views.CreatePredictionView.as_view(), name='create-prediction'),
    path('api/predictions/<str:game_title>/<str:journalist_name>/', views.AnalystPredictionsView.as_view(), name='game-journalist-predictions'),
    path('increment-click/<int:game_id>/', views.increment_click, name='increment_click'),
    path('search-games/', views.search_games, name='search_games'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserSignInView.as_view(), name='login'),
]   
