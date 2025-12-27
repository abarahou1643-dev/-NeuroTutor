# deploy.ps1 - Script de déploiement complet
Write-Host "🚀 Déploiement de NeuroTutor" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier les outils nécessaires
Write-Host "`n🔧 Vérification des outils..." -ForegroundColor Yellow

# Vérifier Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker non installé" -ForegroundColor Red
    Write-Host "📥 Télécharger: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé" -ForegroundColor Red
    Write-Host "📥 Télécharger: https://nodejs.org/" -ForegroundColor Yellow
}

# Vérifier Java
try {
    java -version 2>&1 | Out-Null
    Write-Host "✅ Java installé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Java non trouvé (nécessaire pour les services Java)" -ForegroundColor Yellow
}

# Vérifier Python
try {
    python --version | Out-Null
    Write-Host "✅ Python installé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Python non trouvé (nécessaire pour AI Service)" -ForegroundColor Yellow
}

# Arrêter les services existants
Write-Host "`n🛑 Nettoyage des services existants..." -ForegroundColor Yellow
docker-compose -f docker-compose-db.yml down 2>$null

# Démarrer les bases de données
Write-Host "`n🗄️ Démarrage des bases de données..." -ForegroundColor Blue
docker-compose -f docker-compose-db.yml up -d

# Attendre que les bases soient prêtes
Write-Host "⏳ Attente du démarrage des bases (15 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Vérifier les bases
Write-Host "`n🔍 Vérification des services..." -ForegroundColor Cyan

$services = @(
    @{Name="PostgreSQL"; Port=5432; Test="Test-NetConnection localhost -Port 5432 -InformationLevel Quiet"},
    @{Name="MongoDB"; Port=27017; Test="Test-NetConnection localhost -Port 27017 -InformationLevel Quiet"},
    @{Name="Redis"; Port=6379; Test="Test-NetConnection localhost -Port 6379 -InformationLevel Quiet"}
)

foreach ($service in $services) {
    try {
        Invoke-Expression $service.Test | Out-Null
        Write-Host "✅ $($service.Name) :$($service.Port) - En ligne" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) :$($service.Port) - Hors ligne" -ForegroundColor Red
    }
}

# Démarrer les services applicatifs
Write-Host "`n⚡ Démarrage des services applicatifs..." -ForegroundColor Magenta

# Créer un script de démarrage pour chaque service
$startScript = @'
# start-services.ps1
Write-Host "Démarrage des services NeuroTutor..." -ForegroundColor Cyan

# 1. Auth Service
Write-Host "`n🔐 Démarrage du Auth Service..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\services\auth-service'; mvn spring-boot:run`"" -WindowStyle Normal

# 2. Exercise Service
Write-Host "`n📚 Démarrage du Exercise Service..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\services\exercise-service'; mvn spring-boot:run`"" -WindowStyle Normal

# 3. Frontend
Write-Host "`n🌐 Démarrage du Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\frontend'; npm run dev`"" -WindowStyle Normal

# 4. AI Service (optionnel)
Write-Host "`n🧠 AI Service: optionnel" -ForegroundColor Gray

Write-Host "`n✅ Tous les services ont été lancés dans des fenêtres séparées" -ForegroundColor Green
Write-Host "`n📌 Gardez ces fenêtres ouvertes pour que les services continuent à tourner" -ForegroundColor Yellow
'@

$startScript | Out-File -FilePath "start-services.ps1" -Encoding UTF8

# Vérifier et installer les dépendances frontend
Write-Host "`n📦 Vérification des dépendances frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    cd frontend
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installation des dépendances npm..." -ForegroundColor Yellow
        npm install
    }
    cd ..
}

# Afficher les URLs
Write-Host "`n🌐 URLs de l'application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "   Auth API: http://localhost:8080" -ForegroundColor White
Write-Host "   Exercise API: http://localhost:8083" -ForegroundColor White
Write-Host "   AI API: http://localhost:8082 (si démarré)" -ForegroundColor White

Write-Host "`n🔑 Compte de test:" -ForegroundColor Yellow
Write-Host "   Email: test@neurotutor.com" -ForegroundColor White
Write-Host "   Mot de passe: test123" -ForegroundColor White

Write-Host "`n🚀 Commandes de démarrage:" -ForegroundColor Magenta
Write-Host "   1. Pour démarrer tous les services: .\start-services.ps1" -ForegroundColor Gray
Write-Host "   2. Pour arrêter les bases: docker-compose -f docker-compose-db.yml down" -ForegroundColor Gray
Write-Host "   3. Pour voir les logs: docker-compose -f docker-compose-db.yml logs -f" -ForegroundColor Gray

Write-Host "`n  Bases de données prêtes !" -ForegroundColor Green
Write-Host "=" * 60