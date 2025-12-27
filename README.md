
# Rapport De Projet : NeuroTutor Enseignant Virtuel des Mathématiques
---

##  Introduction

### Contexte et Problématique

Dans un paysage éducatif en pleine transformation numérique, l'apprentissage des mathématiques reste un défi majeur pour des millions d'étudiants à travers le monde. Les approches traditionnelles d'enseignement présentent plusieurs limitations critiques :

1. **Uniformité du contenu** : Tous les élèves reçoivent le même matériel pédagogique, sans considération de leur niveau individuel
2. **Feedback retardé** : Les corrections arrivent souvent trop tard pour un apprentissage efficace
3. **Manque de personnalisation** : Difficulté à adapter le rythme aux besoins spécifiques de chaque apprenant
4. **Démotivation** : Le sentiment d'incompréhension accumulé conduit à l'abandon

Face à ces défis, **NeuroTutor** émerge comme une solution innovante, fusionnant les dernières avancées en intelligence artificielle avec des principes pédagogiques éprouvés pour créer une expérience d'apprentissage véritablement personnalisée.

---

##  Motivation

Les approches d'apprentissage en ligne sont souvent uniformes. NeuroTutor adapte le contenu et la difficulté des exercices selon le profil et les performances de chaque apprenant.

---

##  Objectifs Stratégiques

### Objectif Principal

Développer une plateforme intelligente d'apprentissage des mathématiques qui s'adapte dynamiquement au profil cognitif de chaque utilisateur, fournissant un parcours personnalisé depuis les bases fondamentales jusqu'aux concepts avancés.

### Objectifs Spécifiques

#### **Pédagogiques**
- Réduire de **50%** le temps nécessaire à la maîtrise des concepts mathématiques fondamentaux
- Augmenter de **60%** le taux de rétention à long terme
- Diminuer de **70%** le sentiment d'anxiété face aux mathématiques
- Personnaliser **100%** du parcours d'apprentissage selon le profil individuel

#### **Technologiques**
- Détection précise **(95%)** des types d'erreurs via l'analyse automatique
- Temps de réponse **< 2 secondes** pour la correction et le feedback
- Support natif de l'écriture manuscrite et des notations mathématiques complexes
- Interprétation sémantique des raisonnements textuels des étudiants

---

##  Description Logicielle

- **Backend (Spring Boot)** : moteur d'évaluation, génération d'exercices symboliques, gestion des profils utilisateurs
- **Frontend (React)** : espace interactif avec visualisation des progrès, quiz dynamiques
- **Mobile (React Native)** : capture d'exercices manuscrits, correction instantanée
- **IA** : Knowledge Tracing pour le suivi de compétence, NLP pour l'interprétation des réponses textuelles

---

## 📊 Diagramme BPMN avec Description Détaillée

<img width="945" height="1362" alt="image" src="https://github.com/user-attachments/assets/f2158b64-c2e1-49ae-9f02-72b1c17d7a07" />


### Processus Principal : Parcours d'Apprentissage

### Processus Métiers Détails

| **Processus** | **Description** | **Acteurs** | **Événements** |
|--------------|----------------|------------|---------------|
| **Inscription/Connexion** | Gestion compte utilisateur | Élève, Enseignant, Admin | Registration, Login, Password Reset |
| **Évaluation Diagnostique** | Test initial de niveau | Élève, Système IA | Start Test, Submit Answers, Get Level |
| **Apprentissage Adaptatif** | Boucle d'apprentissage | Élève, Moteur Adaptatif | Get Exercise, Submit Answer, Receive Feedback |
| **Correction Automatique** | Traitement des réponses | Système IA, Élève | Upload Answer, Process, Return Correction |
| **Monitoring Enseignant** | Suivi des progrès | Enseignant, Système | View Dashboard, Generate Reports, Set Alerts |
| **Gestion Contenu** | CRUD exercices | Enseignant, Admin | Create Exercise, Update, Delete, Validate |

---

##  Architecture Microservices

Schéma Vue d'Ensemble
<img width="964" height="859" alt="image" src="https://github.com/user-attachments/assets/52131126-9f5f-40f1-85e3-c1c643e213dc" />


### Rôle de Chaque Microservice

| **Service** | **Rôle** | **Responsabilités** |
|------------|----------|-------------------|
| **Auth Service** | Authentification | JWT, OAuth2, Sessions, Permissions |
| **User Profile Service** | Gestion profils | CRUD utilisateurs, Préférences, Historique |
| **Exercise Service** | Gestion exercices | CRUD exercices, Catégorisation, Validation |
| **Adaptive Engine Service** | Moteur d'adaptation | Recommandation exercices, Adaptation difficulté |
| **AI Evaluation Service** | Correction IA | NLP, OCR, Évaluation automatique |
| **Progress Tracking Service** | Suivi progression | Analytics, Rapports, Dashboards |
| **Content Management Service** | Gestion contenu | Modération, Validation, Organisation |
| **Notification Service** | Notifications | Emails, Push, Rappels |

### Technologies par Microservice

| **Service** | **Framework** | **Langage** | **Base Données** | **Cache** | **File Storage** |
|------------|--------------|------------|-----------------|-----------|-----------------|
| **Auth Service** | Spring Boot | Java 17 | PostgreSQL | Redis | - |
| **User Profile Service** | Spring Boot | Java 17 | PostgreSQL | Redis | AWS S3 (avatars) |
| **Exercise Service** | Spring Boot | Java 17 | MongoDB | Redis | - |
| **Adaptive Engine Service** | Python FastAPI | Python 3.10 | PostgreSQL | Redis | - |
| **AI Evaluation Service** | Python FastAPI | Python 3.10 | - | Redis | AWS S3 (modèles) |
| **Progress Tracking Service** | Spring Boot | Java 17 | TimescaleDB | Redis | - |
| **Content Management Service** | Spring Boot | Java 17 | PostgreSQL | Redis | - |
| **Notification Service** | Node.js | JavaScript | MongoDB | - | - |

### Bases de Données par Service

<img width="945" height="608" alt="image" src="https://github.com/user-attachments/assets/bf25d248-0b44-4dac-aeb7-23eef4cd4d7b" />

### Communication entre Microservices

| **Communication** | **Type** | **Outil** | **Protocole** | **Description** |
|-----------------|----------|-----------|---------------|----------------|
| **Sync API Calls** | Synchrone | REST | HTTP/2 | Pour requêtes immédiates |
| **Async Events** | Asynchrone | Kafka | TCP | Pour événements métier |
| **Service Discovery** | Synchrone | Consul | HTTP | Découverte de services |
| **Circuit Breaker** | Synchrone | Resilience4j | - | Gestion des pannes |
| **Message Queue** | Asynchrone | RabbitMQ | AMQP | Tâches en arrière-plan |

---

## 🔧 Conception des Microservices

### Auth Service - Diagramme de Classes

<img width="945" height="884" alt="image" src="https://github.com/user-attachments/assets/64c4fb7e-0a5b-44a2-b079-d9cd0b0dac99" />


### Communication entre Microservices

| **Communication** | **Type** | **Outil** | **Protocole** | **Description** |
|-----------------|----------|-----------|---------------|----------------|
| **Sync API Calls** | Synchrone | REST | HTTP/2 | Pour requêtes immédiates |
| **Async Events** | Asynchrone | Kafka | TCP | Pour événements métier |
| **Service Discovery** | Synchrone | Consul | HTTP | Découverte de services |
| **Circuit Breaker** | Synchrone | Resilience4j | - | Gestion des pannes |
| **Message Queue** | Asynchrone | RabbitMQ | AMQP | Tâches en arrière-plan |

### Exemple de Workflow Asynchrone :

<img width="945" height="707" alt="image" src="https://github.com/user-attachments/assets/de965fc4-36d3-48b0-8162-3853236106c4" />


---

## 🔧 Conception des Microservices (Suite)

### Auth Service - Diagramme de Classes

<img width="945" height="884" alt="image" src="https://github.com/user-attachments/assets/34e5302b-8b96-4b84-9a2c-3e16ccb8c4e7" />


### Cas d'Utilisation Auth Service :

<img width="945" height="582" alt="image" src="https://github.com/user-attachments/assets/7c82b059-65a0-4b42-bc6e-9d856cbc677c" />

### Adaptive Engine Service - Diagramme de Classes

<img width="945" height="978" alt="image" src="https://github.com/user-attachments/assets/c4abc38a-c884-4ba0-8851-7eb9e2815f7f" />


---


https://github.com/user-attachments/assets/62ddfb2f-44e2-4905-a65e-5c2f598dc8d5




https://github.com/user-attachments/assets/5fbefc7e-eeb6-44cd-8a4e-062c828bcd80



https://github.com/user-attachments/assets/93f80d5b-7904-4ebe-8adb-810835cece75


https://github.com/user-attachments/assets/e56e5ff0-0f90-4d8d-ac7a-08318f8823bf



https://github.com/user-attachments/assets/75026a92-0758-4e5a-99e1-60e8269717f6




https://github.com/user-attachments/assets/616342f9-7403-46fb-88e2-9c2673c415e0


https://github.com/user-attachments/assets/3686a0aa-c52b-4592-bbdf-974a017e3f2a




##  Conclusion

Ce rapport présente une architecture complète et évolutive pour **NeuroTutor**. Les diagrammes et spécifications fournissent une base solide pour le développement d'une plateforme d'apprentissage adaptatif innovante qui transformera l'expérience d'apprentissage des mathématiques.

---

Réalisé par : AICHA BARAHOU, HANA BENZIAT


Année académique : 2025/2026


Master : Didactique des Sciences et Ingénierie éducative - Option Technologies Émergentes en Éducation (TEE)






