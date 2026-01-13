# API Backend - Express + Prisma + MongoDB

## Stack Technique

- **Express.js** - Framework web Node.js
- **Prisma** - ORM pour MongoDB
- **MongoDB** - Base de données NoSQL
- **Docker** - Conteneurisation de MongoDB

## Installation

### 1. Installer les dépendances

```bash
cd api
npm install
```

### 2. Démarrer MongoDB avec Docker

```bash
# À la racine du projet
docker-compose up -d
```

Cela va démarrer MongoDB sur le port 27017 avec :
- Username: `admin`
- Password: `password123`
- Database: `projet_final`

### 3. Générer le client Prisma

```bash
cd api
npx prisma generate
```

### 4. (Optionnel) Appliquer les migrations

```bash
npx prisma db push
```

## Démarrage

### Mode développement (avec nodemon)

```bash
cd api
npm run dev
```

### Mode production

```bash
cd api
npm start
```

L'API sera accessible sur `http://localhost:3000`

## Routes disponibles

- `GET /` - Test de l'API
- `GET /users` - Récupérer tous les utilisateurs
- `POST /users` - Créer un utilisateur
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```

## Prisma Studio

Pour explorer la base de données avec une interface graphique :

```bash
cd api
npx prisma studio
```

## Configuration

Les variables d'environnement sont dans `api/.env` :

```
DATABASE_URL="mongodb://admin:password123@localhost:27017/projet_final?authSource=admin&retryWrites=true&w=majority"
PORT=3000
```

## Commandes utiles

### Docker

```bash
# Démarrer MongoDB
docker-compose up -d

# Arrêter MongoDB
docker-compose down

# Voir les logs
docker-compose logs -f mongodb
```

### Prisma

```bash
# Générer le client
npx prisma generate

# Pousser le schema vers la DB
npx prisma db push

# Ouvrir Prisma Studio
npx prisma studio
```
