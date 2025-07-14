#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ProManager.settings')
django.setup()

def test_dashboard_api():
    # URL de l'API
    url = "http://127.0.0.1:8000/api/dashboard/chef/"
    
    # Headers pour l'authentification (vous devrez remplacer par un vrai token)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'  # Remplacez par un vrai token
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Données reçues: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"Erreur: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion: {e}")
    except Exception as e:
        print(f"Erreur générale: {e}")

if __name__ == '__main__':
    print("Test de l'API Dashboard Chef")
    print("Note: Vous devez remplacer YOUR_TOKEN_HERE par un vrai token d'authentification")
    test_dashboard_api() 