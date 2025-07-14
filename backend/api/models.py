from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

class Membre(models.Model):
    ROLE_CHOICES = [
        ("ADMIN", "Administrateur"),
        ("CHEF_PROJET", "Chef de projet"),
        ("MEMBRE", "Membre"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="membre_profile")
    nom = models.CharField(max_length=50, verbose_name="Nom du Membre")
    date_creation = models.DateTimeField(default=timezone.now, verbose_name="Date de Création")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="MEMBRE", verbose_name="Rôle du Membre")
    is_active = models.BooleanField(default=True, verbose_name="Compte actif")
    archived_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")

    class Meta:
        verbose_name = "Membre"
        verbose_name_plural = "Membres"
        db_table = 'MEMBRES'
        ordering = ['nom']  # correspond au champ 'nom' défini ci-dessus

    def __str__(self):
        return f"{self.nom} (User: {self.user.username})"


class Projet(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()
    date_debut = models.DateField()
    date_fin = models.DateField()
    statut = models.CharField(max_length=50)
    cree_par = models.ForeignKey(Membre, on_delete=models.CASCADE, related_name="projets")
    membres = models.ManyToManyField(Membre, related_name="projets_membre", blank=True)

    def __str__(self):
        return self.nom


class Tache(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    date_debut = models.DateField()
    date_fin = models.DateField()
    statut = models.CharField(max_length=50)
    priorite = models.CharField(max_length=50)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="taches")
    assignee = models.ForeignKey(Membre, on_delete=models.SET_NULL, null=True, blank=True, related_name="taches_assignees")

    def __str__(self):
        return self.nom


class Fichier(models.Model):
    nom = models.CharField(max_length=100)
    fichier = models.FileField(upload_to='fichiers/', null=True, blank=True)
    date_partage = models.DateField()
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="fichiers")

    def __str__(self):
        return self.nom


class Commentaire(models.Model):
    contenu = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    tache = models.ForeignKey(Tache, on_delete=models.CASCADE, related_name="commentaires")
    auteur = models.ForeignKey(Membre, on_delete=models.CASCADE)

    def __str__(self):
        return f"Commentaire de {self.auteur.nom} sur {self.tache.nom}"
