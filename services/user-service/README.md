# Service de Gestion des Profils Utilisateurs

Ce service fait partie de l'écosystème NeuroTutor et est responsable de la gestion des profils utilisateurs, y compris les informations personnelles, les préférences et l'historique d'apprentissage.

## Fonctionnalités

- **Gestion des utilisateurs** : CRUD complet pour les profils utilisateurs
- **Gestion des avatars** : Téléchargement et stockage d'avatars utilisateurs (compatible S3)
- **Préférences utilisateur** : Gestion des préférences personnalisables (thème, langue, notifications)
- **Historique d'apprentissage** : Suivi des activités d'apprentissage des utilisateurs
- **API RESTful** : Interface HTTP pour l'intégration avec d'autres services

## Prérequis

- Java 17+
- Maven 3.6+
- PostgreSQL 13+
- AWS S3 (ou compatible) pour le stockage des fichiers

## Configuration

Copiez le fichier `application.yml.example` vers `application.yml` et mettez à jour les configurations selon votre environnement.

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/neurotutor_users
    username: your_username
    password: your_password

aws:
  s3:
    region: your_region
    bucket-name: your-bucket-name
    access-key: your-access-key
    secret-key: your-secret-key
```

## Installation

1. Cloner le dépôt
2. Configurer la base de données PostgreSQL
3. Configurer les informations d'identification AWS S3
4. Construire le projet :

```bash
mvn clean install
```

## Démarrage

```bash
mvn spring-boot:run
```

Le service sera accessible à l'adresse : `http://localhost:8084`

## API Documentation

Une fois le service démarré, vous pouvez accéder à la documentation Swagger UI à l'adresse :
`http://localhost:8084/swagger-ui.html`

## Endpoints Principaux

### Utilisateurs
- `GET /api/v1/users` - Récupérer tous les utilisateurs (paginated)
- `GET /api/v1/users/{id}` - Récupérer un utilisateur par ID
- `POST /api/v1/users` - Créer un nouvel utilisateur
- `PUT /api/v1/users/{id}` - Mettre à jour un utilisateur
- `DELETE /api/v1/users/{id}` - Supprimer un utilisateur
- `POST /api/v1/users/{id}/avatar` - Télécharger un avatar
- `DELETE /api/v1/users/{id}/avatar` - Supprimer l'avatar

### Préférences Utilisateur
- `GET /api/v1/users/{userId}/preferences` - Récupérer les préférences
- `PUT /api/v1/users/{userId}/preferences` - Mettre à jour les préférences

### Historique d'Apprentissage
- `GET /api/v1/users/{userId}/history` - Récupérer l'historique
- `POST /api/v1/users/{userId}/history` - Ajouter une entrée d'historique
- `GET /api/v1/users/{userId}/history/{historyId}` - Récupérer une entrée spécifique
- `PUT /api/v1/users/{userId}/history/{historyId}` - Mettre à jour une entrée
- `DELETE /api/v1/users/{userId}/history/{historyId}` - Supprimer une entrée

## Tests

Pour exécuter les tests :

```bash
mvn test
```

## Déploiement

Le service peut être empaqueté en tant que fichier JAR exécutable :

```bash
mvn clean package
java -jar target/user-service-1.0.0-SNAPSHOT.jar
```

## Sécurité

- Tous les endpoints (sauf `/api/v1/health`) nécessitent une authentification JWT valide
- Les mots de passe sont stockés de manière sécurisée avec BCrypt
- Les fichiers sont stockés de manière sécurisée sur S3 avec des autorisations appropriées

## Journalisation

Les logs sont configurés pour sortir sur la console et dans des fichiers rotatifs. Le niveau de log par défaut est INFO.
