from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone

# Create your views here.

from rest_framework import viewsets
from .models import Membre, Projet, Tache, Fichier, Commentaire
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import action
from django.db import models

class MembreViewSet(viewsets.ModelViewSet):
    queryset = Membre.objects.all()
    serializer_class = MembreSerializer

    def get_queryset(self):
        # Par défaut, ne montrer que les utilisateurs actifs
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if show_archived:
            return Membre.objects.all()
        return Membre.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MembreDetailSerializer
        return MembreSerializer

    def get_object_for_archive_actions(self):
        """Récupérer un objet membre sans filtrage par is_active pour les actions d'archivage"""
        queryset = Membre.objects.all()
        filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
        obj = queryset.get(**filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archiver un utilisateur (désactiver sans supprimer)"""
        try:
            membre = self.get_object_for_archive_actions()
            membre.is_active = False
            membre.archived_at = timezone.now()
            membre.save()
            return Response({
                'success': True, 
                'message': f'Utilisateur {membre.nom} archivé avec succès'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur lors de l\'archivage: {str(e)}'
            }, status=500)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """Réactiver un utilisateur archivé"""
        try:
            membre = self.get_object_for_archive_actions()
            membre.is_active = True
            membre.archived_at = None
            membre.save()
            return Response({
                'success': True, 
                'message': f'Utilisateur {membre.nom} réactivé avec succès'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur lors de la réactivation: {str(e)}'
            }, status=500)

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

class IsMembreOrChefOrAdmin(permissions.BasePermission):
    """Permission pour permettre aux membres de voir et d'ajouter du contenu."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user.is_authenticated:
            return False
        try:
            membre = user.membre_profile
            # Tous les rôles peuvent ajouter du contenu (commentaires, fichiers)
            # Accepter les formats français et anglais
            return membre.role in ["ADMIN", "CHEF_PROJET", "MEMBRE"]
        except Exception:
            return False

# Ajouter les permissions au MembreViewSet après la définition des classes de permission
MembreViewSet.permission_classes = [IsChefProjetOrAdmin]

class ProjetViewSet(viewsets.ModelViewSet):
    serializer_class = ProjetSerializer
    permission_classes = [IsMembreOrChefOrAdmin]

    def get_permissions(self):
        """
        Les membres peuvent voir les projets, mais seuls les chefs/admin peuvent les modifier.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_member', 'remove_member']:
            permission_classes = [IsChefProjetOrAdmin]
        else:
            permission_classes = [IsMembreOrChefOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        try:
            membre = user.membre_profile
            # ADMIN voit tous les projets
            if membre.role in ['ADMIN', 'Admin']:
                return Projet.objects.all()
            # Les autres (CHEF_PROJET et MEMBRE) ne voient que leurs projets (créés par eux ou où ils sont membres)
            return Projet.objects.filter(
                models.Q(cree_par=membre) | models.Q(membres=membre)
            ).distinct()
        except:
            return Projet.objects.none()

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
    serializer_class = TacheSerializer
    permission_classes = [IsMembreOrChefOrAdmin]

    def get_queryset(self):
        user = self.request.user
        try:
            membre = user.membre_profile
            # ADMIN voit toutes les tâches
            if membre.role in ['ADMIN', 'Admin']:
                return Tache.objects.all()
            # Les autres ne voient que les tâches des projets où ils sont membres
            projets_membre = Projet.objects.filter(
                models.Q(cree_par=membre) | models.Q(membres=membre)
            )
            return Tache.objects.filter(projet__in=projets_membre)
        except:
            return Tache.objects.none()

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
        
        # Vérifier que l'utilisateur peut modifier cette tâche
        user = request.user
        try:
            membre = user.membre_profile
            # ADMIN et CHEF_PROJET peuvent modifier toutes les tâches
            if membre.role in ['ADMIN', 'CHEF_PROJET']:
                pass
            # MEMBRE ne peut modifier que ses tâches assignées
            elif membre.role == 'MEMBRE':
                if tache.assignee != membre:
                    return Response({'error': 'Vous ne pouvez modifier que vos tâches assignées'}, status=403)
            else:
                return Response({'error': 'Permission insuffisante'}, status=403)
        except:
            return Response({'error': 'Erreur de permission'}, status=403)
        
        tache.statut = nouveau_statut
        tache.save()
        return Response({'success': True, 'message': f'Statut changé à {nouveau_statut}'})

class FichierViewSet(viewsets.ModelViewSet):
    serializer_class = FichierSerializer
    permission_classes = [IsMembreOrChefOrAdmin]

    def get_queryset(self):
        user = self.request.user
        try:
            membre = user.membre_profile
            # ADMIN voit tous les fichiers
            if membre.role in ['ADMIN', 'Admin']:
                queryset = Fichier.objects.all()
            else:
                # Les autres ne voient que les fichiers des projets où ils sont membres
                projets_membre = Projet.objects.filter(
                    models.Q(cree_par=membre) | models.Q(membres=membre)
                )
                queryset = Fichier.objects.filter(projet__in=projets_membre)
            
            # Filtrer par projet si le paramètre est fourni
            projet_id = self.request.query_params.get('projet')
            if projet_id:
                queryset = queryset.filter(projet_id=projet_id)
            
            return queryset
        except:
            return Fichier.objects.none()

class CommentaireViewSet(viewsets.ModelViewSet):
    serializer_class = CommentaireSerializer
    permission_classes = [IsMembreOrChefOrAdmin]

    def get_queryset(self):
        user = self.request.user
        try:
            membre = user.membre_profile
            # ADMIN voit tous les commentaires
            if membre.role in ['ADMIN', 'Admin']:
                queryset = Commentaire.objects.all()
            else:
                # Les autres ne voient que les commentaires des tâches des projets où ils sont membres
                projets_membre = Projet.objects.filter(
                    models.Q(cree_par=membre) | models.Q(membres=membre)
                )
                taches_membre = Tache.objects.filter(projet__in=projets_membre)
                queryset = Commentaire.objects.filter(tache__in=taches_membre)
            
            # Filtrer par tâche si le paramètre est fourni
            tache_id = self.request.query_params.get('tache')
            if tache_id:
                queryset = queryset.filter(tache_id=tache_id)
            
            return queryset
        except:
            return Commentaire.objects.none()


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
            print(f"Utilisateur: {user.username}, Membre: {membre.nom}, Role: {membre.role}")
        except Exception as e:
            print(f"Erreur profil membre: {e}")
            return DRFResponse({'error': 'Profil membre non trouvé pour cet utilisateur'}, status=400)
        
        try:
            # Projets où il est chef
            projets_chef = Projet.objects.filter(cree_par=membre)
            projets_ids = list(projets_chef.values_list('id', flat=True))
            print(f"Nombre de projets trouvés: {projets_chef.count()}")
            
            # Gérer le cas où il n'y a pas de projets
            if not projets_ids:
                return DRFResponse({
                    'projets_count': 0,
                    'taches_total': 0,
                    'taches_terminees': 0,
                    'taches_en_cours': 0,
                    'taches_retard': 0,
                    'projets': [],
                    'membres': [],
                    'activites': [],
                })
            
            taches_total = Tache.objects.filter(projet_id__in=projets_ids).count()
            taches_terminees = Tache.objects.filter(projet_id__in=projets_ids, statut='Terminé').count()
            taches_en_cours = Tache.objects.filter(projet_id__in=projets_ids, statut='En cours').count()
            taches_retard = Tache.objects.filter(projet_id__in=projets_ids, date_fin__lt=timezone.now().date()).exclude(statut='Terminé').count()
            
            # Données des projets
            projets_data = [
                {
                    'id': p.id,
                    'nom': p.nom,
                    'statut': p.statut,
                    'date_debut': p.date_debut,
                    'date_fin': p.date_fin,
                } for p in projets_chef
            ]
            
            # Membres des projets (tous les membres qui participent aux projets du chef)
            membres_projets = Membre.objects.filter(projets_membre__in=projets_chef).distinct()
            membres_data = []
            for m in membres_projets:
                # Compter les tâches assignées à ce membre dans les projets du chef
                taches_membre = Tache.objects.filter(
                    projet_id__in=projets_ids,
                    assignee=m
                ).count()
                membres_data.append({
                    'id': m.id,
                    'nom': m.nom,
                    'role': m.role,
                    'taches': taches_membre,
                })
            
            # Activités récentes (tâches créées/modifiées/terminées dans les projets du chef)
            taches_recentes = Tache.objects.filter(
                projet_id__in=projets_ids
            ).order_by('-date_debut')[:10]
            
            activites_data = []
            for tache in taches_recentes:
                # Déterminer le type d'activité basé sur le statut et la date
                if tache.statut == 'Terminé':
                    action = 'terminée'
                    date_activite = tache.date_fin
                elif tache.statut == 'En cours':
                    action = 'démarrée'
                    date_activite = tache.date_debut
                else:
                    action = 'créée'
                    date_activite = tache.date_debut
                
                activites_data.append({
                    'type': 'tache',
                    'action': action,
                    'nom': tache.nom,
                    'date': date_activite.strftime('%Y-%m-%d'),
                    'user': tache.assignee.nom if tache.assignee else 'Non assignée',
                    'projet': tache.projet.nom,
                })
            
            return DRFResponse({
                'projets_count': projets_chef.count(),
                'taches_total': taches_total,
                'taches_terminees': taches_terminees,
                'taches_en_cours': taches_en_cours,
                'taches_retard': taches_retard,
                'projets': projets_data,
                'membres': membres_data,
                'activites': activites_data,
            })
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Erreur dans ChefDashboardStatsView: {str(e)}")
            print(f"Traceback: {error_details}")
            return DRFResponse({'error': f'Erreur lors de la récupération des données: {str(e)}'}, status=500)

class MembreDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            membre = user.membre_profile
        except:
            return DRFResponse({'error': 'Profil membre non trouvé pour cet utilisateur'}, status=400)
        
        try:
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
        except Exception as e:
            return DRFResponse({'error': f'Erreur lors de la récupération des données: {str(e)}'}, status=500)

