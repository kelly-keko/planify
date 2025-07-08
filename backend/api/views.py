from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

from rest_framework import viewsets
from .models import Membre, Projet, Tache, Fichier, Commentaire
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import action

class MembreViewSet(viewsets.ModelViewSet):
    queryset = Membre.objects.all()
    serializer_class = MembreSerializer

class IsChefProjetOrAdmin(permissions.BasePermission):
    """Permission pour autoriser seulement les chefs de projet ou admins à créer/modifier un projet."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user.is_authenticated:
            return False
        try:
            membre = user.membre_profile
            return membre.role in ["ADMIN", "CHEF_PROJET"]
        except Exception:
            return False

class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsChefProjetOrAdmin]

    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = ProjetDetailSerializer
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        projet = self.get_object()
        membre_id = request.data.get('membre_id')
        if not membre_id:
            return Response({'error': 'membre_id requis'}, status=400)
        try:
            membre = Membre.objects.get(id=membre_id)
            projet.membres.add(membre)
            return Response({'success': True, 'message': f'{membre.nom} ajouté au projet'})
        except Membre.DoesNotExist:
            return Response({'error': 'Membre non trouvé'}, status=404)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        projet = self.get_object()
        membre_id = request.data.get('membre_id')
        if not membre_id:
            return Response({'error': 'membre_id requis'}, status=400)
        try:
            membre = Membre.objects.get(id=membre_id)
            projet.membres.remove(membre)
            return Response({'success': True, 'message': f'{membre.nom} retiré du projet'})
        except Membre.DoesNotExist:
            return Response({'error': 'Membre non trouvé'}, status=404)

    @action(detail=False, methods=['get'])
    def available_members(self, request):
        membres = Membre.objects.all()
        data = [{'id': m.id, 'nom': m.nom, 'role': m.role} for m in membres]
        return Response(data)

class TacheViewSet(viewsets.ModelViewSet):
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer
    permission_classes = [IsChefProjetOrAdmin]

    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = TacheDetailSerializer
        return super().retrieve(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        # Filtrer par projet si un projet_id est fourni
        projet_id = request.query_params.get('projet_id')
        if projet_id:
            self.queryset = self.queryset.filter(projet_id=projet_id)
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        tache = self.get_object()
        membre_id = request.data.get('membre_id')
        if not membre_id:
            return Response({'error': 'membre_id requis'}, status=400)
        try:
            membre = Membre.objects.get(id=membre_id)
            tache.assignee = membre
            tache.save()
            return Response({'success': True, 'message': f'Tâche assignée à {membre.nom}'})
        except Membre.DoesNotExist:
            return Response({'error': 'Membre non trouvé'}, status=404)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        tache = self.get_object()
        nouveau_statut = request.data.get('statut')
        if not nouveau_statut:
            return Response({'error': 'statut requis'}, status=400)
        
        statuts_valides = ['En attente', 'En cours', 'Terminé', 'Annulé']
        if nouveau_statut not in statuts_valides:
            return Response({'error': 'Statut invalide'}, status=400)
        
        tache.statut = nouveau_statut
        tache.save()
        return Response({'success': True, 'message': f'Statut changé à {nouveau_statut}'})

class FichierViewSet(viewsets.ModelViewSet):
    queryset = Fichier.objects.all()
    serializer_class = FichierSerializer

class CommentaireViewSet(viewsets.ModelViewSet):
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer


def accueil(request):
    return JsonResponse({"message": "Bienvenue sur l'API ProManager"})

from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer

# Serializer pour inscription
class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    # On crée l'utilisateur avec hash du mot de passe ET un membre associé
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        
        # Créer automatiquement un membre associé à cet utilisateur
        Membre.objects.create(
            user=user,
            nom=user.username,  # Utilise le username comme nom par défaut
            role="Membre"       # Rôle par défaut
        )
        
        return user

# Vue d'inscription
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            username = request.data.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    try:
                        membre = Membre.objects.get(user=user)
                        response.data['user_id'] = user.id
                        response.data['membre_id'] = membre.id
                        response.data['role'] = membre.role
                    except Membre.DoesNotExist:
                        membre = Membre.objects.create(
                            user=user,
                            nom=user.username,
                            role="MEMBRE"
                        )
                        response.data['user_id'] = user.id
                        response.data['membre_id'] = membre.id
                        response.data['role'] = membre.role
                except User.DoesNotExist:
                    pass
        
        return response

from rest_framework.views import APIView
from rest_framework.response import Response as DRFResponse
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            membre = user.membre_profile
            projets_count = membre.projets.count()
            taches_count = membre.taches_assignees.filter(statut='Terminé').count()
            return DRFResponse({
                'username': user.username,
                'email': user.email,
                'nom': membre.nom,
                'role': membre.role,
                'projets_count': projets_count,
                'taches_terminees': taches_count
            })
        except Exception as e:
            return DRFResponse({'error': str(e)}, status=400)

    def patch(self, request):
        user = request.user
        data = request.data
        try:
            membre = user.membre_profile
            # Mise à jour du nom du membre
            if 'nom' in data:
                membre.nom = data['nom']
            # Mise à jour de l'email utilisateur
            if 'email' in data:
                user.email = data['email']
            # Le rôle ne peut pas être modifié par l'utilisateur
            membre.save()
            user.save()
            return DRFResponse({'success': True, 'message': 'Profil mis à jour.'})
        except Exception as e:
            return DRFResponse({'error': str(e)}, status=400)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Statistiques globales
        projets_count = Projet.objects.count()
        taches_count = Tache.objects.count()
        taches_terminees = Tache.objects.filter(statut='Terminé').count()
        taches_en_cours = Tache.objects.filter(statut='En cours').count()
        taches_en_attente = Tache.objects.filter(statut='En attente').count()
        taches_annulees = Tache.objects.filter(statut='Annulé').count()
        # Tâches en retard (date_fin < aujourd'hui et pas terminées)
        today = timezone.now().date()
        taches_retard = Tache.objects.filter(date_fin__lt=today).exclude(statut='Terminé').count()
        # Projets récents
        projets_recents = Projet.objects.order_by('-id')[:5]
        projets_recents_data = [
            {
                'id': p.id,
                'nom': p.nom,
                'statut': p.statut,
                'date_debut': p.date_debut,
                'date_fin': p.date_fin,
            } for p in projets_recents
        ]
        # Tâches à venir (prochaines échéances)
        taches_a_venir = Tache.objects.filter(date_fin__gte=today).order_by('date_fin')[:5]
        taches_a_venir_data = [
            {
                'id': t.id,
                'nom': t.nom,
                'statut': t.statut,
                'date_fin': t.date_fin,
                'projet': t.projet.nom,
            } for t in taches_a_venir
        ]
        return DRFResponse({
            'projets_count': projets_count,
            'taches_count': taches_count,
            'taches_terminees': taches_terminees,
            'taches_en_cours': taches_en_cours,
            'taches_en_attente': taches_en_attente,
            'taches_annulees': taches_annulees,
            'taches_retard': taches_retard,
            'projets_recents': projets_recents_data,
            'taches_a_venir': taches_a_venir_data,
        })

class ChefDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            membre = user.membre_profile
            # Projets où il est chef
            projets_chef = Projet.objects.filter(cree_par=membre)
            projets_ids = projets_chef.values_list('id', flat=True)
            taches_total = Tache.objects.filter(projet_id__in=projets_ids).count()
            taches_terminees = Tache.objects.filter(projet_id__in=projets_ids, statut='Terminé').count()
            taches_en_cours = Tache.objects.filter(projet_id__in=projets_ids, statut='En cours').count()
            taches_retard = Tache.objects.filter(projet_id__in=projets_ids, date_fin__lt=timezone.now().date()).exclude(statut='Terminé').count()
            projets_data = [
                {
                    'id': p.id,
                    'nom': p.nom,
                    'statut': p.statut,
                    'date_debut': p.date_debut,
                    'date_fin': p.date_fin,
                } for p in projets_chef
            ]
            return DRFResponse({
                'projets_count': projets_chef.count(),
                'taches_total': taches_total,
                'taches_terminees': taches_terminees,
                'taches_en_cours': taches_en_cours,
                'taches_retard': taches_retard,
                'projets': projets_data,
            })
        except Exception:
            return DRFResponse({'error': 'Profil chef de projet non trouvé'}, status=404)

class MembreDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            membre = user.membre_profile
            projets = membre.projets_membre.all()
            taches_assignees = membre.taches_assignees.all()
            taches_terminees = taches_assignees.filter(statut='Terminé').count()
            taches_en_cours = taches_assignees.filter(statut='En cours').count()
            taches_retard = taches_assignees.filter(date_fin__lt=timezone.now().date()).exclude(statut='Terminé').count()
            projets_data = [
                {
                    'id': p.id,
                    'nom': p.nom,
                    'statut': p.statut,
                    'date_debut': p.date_debut,
                    'date_fin': p.date_fin,
                } for p in projets
            ]
            taches_data = [
                {
                    'id': t.id,
                    'nom': t.nom,
                    'statut': t.statut,
                    'date_fin': t.date_fin,
                    'projet': t.projet.nom,
                } for t in taches_assignees
            ]
            return DRFResponse({
                'projets_count': projets.count(),
                'taches_total': taches_assignees.count(),
                'taches_terminees': taches_terminees,
                'taches_en_cours': taches_en_cours,
                'taches_retard': taches_retard,
                'projets': projets_data,
                'taches': taches_data,
            })
        except Exception:
            return DRFResponse({'error': 'Profil membre non trouvé'}, status=404)

