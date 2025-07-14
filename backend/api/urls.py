from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import RegisterView, CustomTokenObtainPairView, ProfileView, DashboardStatsView, ChefDashboardStatsView, MembreDashboardStatsView

router = DefaultRouter()
router.register(r'membres', MembreViewSet, basename='membre')
router.register(r'projets', ProjetViewSet, basename='projet')
router.register(r'taches', TacheViewSet, basename='tache')
router.register(r'fichiers', FichierViewSet, basename='fichier')
router.register(r'commentaires', CommentaireViewSet, basename='commentaire')

urlpatterns = [
    path('', include(router.urls)),
        # Route pour obtenir un token avec identifiants
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Route pour rafraîchir le token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Route pour s'inscrire
    path('register/', RegisterView.as_view(), name='register'),

    path('profile/', ProfileView.as_view(), name='profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/chef/', ChefDashboardStatsView.as_view(), name='dashboard-chef'),
    path('dashboard/membre/', MembreDashboardStatsView.as_view(), name='dashboard-membre'),
]






