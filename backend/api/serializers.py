from rest_framework import serializers
from .models import Membre, Projet, Tache, Fichier, Commentaire

class MembreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membre
        fields = '__all__'

class ProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = '__all__'

class TacheSerializer(serializers.ModelSerializer):
    assignee_nom = serializers.CharField(source='assignee.nom', read_only=True)
    
    class Meta:
        model = Tache
        fields = '__all__'

class TacheDetailSerializer(serializers.ModelSerializer):
    assignee = MembreSerializer(read_only=True)
    projet_nom = serializers.CharField(source='projet.nom', read_only=True)
    
    class Meta:
        model = Tache
        fields = '__all__'

class FichierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fichier
        fields = '__all__'

class CommentaireSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    
    class Meta:
        model = Commentaire
        fields = '__all__'

class ProjetDetailSerializer(serializers.ModelSerializer):
    membres = serializers.SerializerMethodField()
    taches = TacheSerializer(many=True, read_only=True)
    cree_par = MembreSerializer(read_only=True)

    def get_membres(self, obj):
        try:
            # Essayer d'accéder au champ membres
            membres = obj.membres.all()
            return MembreSerializer(membres, many=True).data
        except:
            # Si le champ n'existe pas, retourner une liste vide
            return []

    class Meta:
        model = Projet
        fields = '__all__'
        depth = 1
