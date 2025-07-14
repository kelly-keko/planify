#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ProManager.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Membre

def create_chef_user():
    # Créer un utilisateur chef de projet
    username = 'chef_projet'
    email = 'chef@example.com'
    password = 'chef123'
    
    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(username=username).exists():
        print(f"L'utilisateur {username} existe déjà.")
        user = User.objects.get(username=username)
    else:
        # Créer l'utilisateur
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        print(f"Utilisateur {username} créé avec succès.")
    
    # Vérifier si le profil membre existe déjà
    if hasattr(user, 'membre_profile'):
        membre = user.membre_profile
        membre.role = 'CHEF_PROJET'
        membre.nom = 'Chef de Projet Test'
        membre.save()
        print(f"Profil membre mis à jour avec le rôle CHEF_PROJET.")
    else:
        # Créer le profil membre
        membre = Membre.objects.create(
            user=user,
            nom='Chef de Projet Test',
            role='CHEF_PROJET'
        )
        print(f"Profil membre créé avec le rôle CHEF_PROJET.")
    
    print(f"\nIdentifiants de connexion:")
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Role: {membre.role}")
    
    return user, membre

if __name__ == '__main__':
    create_chef_user() 