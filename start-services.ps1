# start-services.ps1 - Script de démarrage des services NeuroTutor
Write-Host "🚀 Démarrage des services NeuroTutor" -ForegroundColor Cyan
Write-Host "=" * 50

# Définir le chemin racine
$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

Write-Host "Chemin du projet: $rootPath" -ForegroundColor Gray

# Vérifier que les bases de données sont en ligne
Write-Host "`n🔍 Vérification des bases de données..." -ForegroundColor Yellow

$dbServices = @(
    @{Name="PostgreSQL"; Port=5432},
    @{Name="MongoDB"; Port=27017},
    @{Name="Redis"; Port=6379}
)

$allRunning = $true
foreach ($service in $dbServices) {
    try {
        Test-NetConnection localhost -Port $service.Port -InformationLevel Quiet | Out-Null
        Write-Host "✅ $($service.Name) :$($service.Port) - En ligne" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) :$($service.Port) - Hors ligne" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host "`n⚠️ Certaines bases de données ne sont pas démarrées" -ForegroundColor Yellow
    Write-Host "Lancez d'abord: .\deploy.ps1" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous démarrer les bases maintenant ? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "Démarrage des bases..." -ForegroundColor Blue
        & "$rootPath\deploy.ps1"
        Start-Sleep -Seconds 10
    }
}

# Démarrer Auth Service
Write-Host "`n🔐 Démarrage du Auth Service (port 8080)..." -ForegroundColor Blue

$authServicePath = "$rootPath\services\auth-service"
if (Test-Path $authServicePath) {
    Write-Host "Chemin Auth Service: $authServicePath" -ForegroundColor Gray

    # Vérifier si Maven est disponible
    try {
        mvn --version 2>$null | Out-Null
        $hasMaven = $true
    } catch {
        $hasMaven = $false
    }

    if ($hasMaven) {
        Write-Host "✅ Maven trouvé, démarrage avec Maven..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$authServicePath'; Write-Host '🔐 Auth Service démarre...'; mvn spring-boot:run`"" -WindowStyle Normal
    } else {
        Write-Host "⚠️ Maven non trouvé, tentative avec le wrapper..." -ForegroundColor Yellow
        if (Test-Path "$authServicePath\mvnw") {
            Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$authServicePath'; Write-Host '🔐 Auth Service démarre...'; .\mvnw spring-boot:run`"" -WindowStyle Normal
        } else {
            Write-Host "❌ Fichier mvnw non trouvé" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Dossier Auth Service non trouvé: $authServicePath" -ForegroundColor Red
}

Start-Sleep -Seconds 5

# Démarrer Exercise Service
Write-Host "`n📚 Démarrage du Exercise Service (port 8083)..." -ForegroundColor Blue

$exerciseServicePath = "$rootPath\services\exercise-service"
if (Test-Path $exerciseServicePath) {
    Write-Host "Chemin Exercise Service: $exerciseServicePath" -ForegroundColor Gray

    if ($hasMaven) {
        Write-Host "✅ Démarrage avec Maven..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$exerciseServicePath'; Write-Host '📚 Exercise Service démarre...'; mvn spring-boot:run`"" -WindowStyle Normal
    } else {
        if (Test-Path "$exerciseServicePath\mvnw") {
            Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$exerciseServicePath'; Write-Host '📚 Exercise Service démarre...'; .\mvnw spring-boot:run`"" -WindowStyle Normal
        } else {
            Write-Host "❌ Fichier mvnw non trouvé" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Dossier Exercise Service non trouvé: $exerciseServicePath" -ForegroundColor Red
}

Start-Sleep -Seconds 5

# Démarrer Frontend
Write-Host "`n🌐 Démarrage du Frontend (port 5174)..." -ForegroundColor Blue

$frontendPath = "$rootPath\frontend"
if (Test-Path $frontendPath) {
    Write-Host "Chemin Frontend: $frontendPath" -ForegroundColor Gray

    # Vérifier Node.js
    try {
        node --version 2>$null | Out-Null
        $hasNode = $true
    } catch {
        $hasNode = $false
        Write-Host "❌ Node.js non trouvé" -ForegroundColor Red
    }

    if ($hasNode) {
        # Vérifier les dépendances
        if (-not (Test-Path "$frontendPath\node_modules")) {
            Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
            cd $frontendPath
            npm install
            cd $rootPath
        }

        Write-Host "✅ Démarrage du serveur de développement..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$frontendPath'; Write-Host '🌐 Frontend démarre...'; npm run dev`"" -WindowStyle Normal
    }
} else {
    Write-Host "❌ Dossier Frontend non trouvé: $frontendPath" -ForegroundColor Red
}

# Démarrer AI Service (optionnel)
Write-Host "`n🧠 AI Service (port 8082) - Optionnel" -ForegroundColor Gray

$aiServicePath = "$rootPath\services\ai-service"
if (Test-Path $aiServicePath) {
    $response = Read-Host "Voulez-vous démarrer l'AI Service ? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "Démarrage AI Service..." -ForegroundColor Blue

        # Vérifier Python
        try {
            python --version 2>$null | Out-Null
            $hasPython = $true
        } catch {
            try {
                python3 --version 2>$null | Out-Null
                $hasPython = $true
            } catch {
                $hasPython = $false
                Write-Host "❌ Python non trouvé" -ForegroundColor Red
            }
        }

        if ($hasPython) {
            Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$aiServicePath'; Write-Host '🧠 AI Service démarre...'; if (Test-Path 'venv') { .\venv\Scripts\activate }; pip install -r requirements.txt; python -m uvicorn src.main:app --host 0.0.0.0 --port 8082`"" -WindowStyle Normal
        }
    }
}

# Afficher les URLs
Write-Host "`n🌐 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "   Auth API: http://localhost:8080" -ForegroundColor White
Write-Host "   Exercise API: http://localhost:8083" -ForegroundColor White
Write-Host "   AI API: http://localhost:8082 (si démarré)" -ForegroundColor White

Write-Host "`n🔑 Compte de test:" -ForegroundColor Yellow
Write-Host "   Email: test@neurotutor.com" -ForegroundColor White
Write-Host "   Mot de passe: test123" -ForegroundColor White

Write-Host "`n📌 Instructions:" -ForegroundColor Magenta
Write-Host "   1. Attendez que chaque service affiche 'Started'" -ForegroundColor Gray
Write-Host "   2. Les services tournent dans des fenêtres séparées" -ForegroundColor Gray
Write-Host "   3. Gardez ces fenêtres ouvertes" -ForegroundColor Gray
Write-Host "   4. Pour arrêter: Fermez les fenêtres ou Ctrl+C" -ForegroundColor Gray

Write-Host "`n⏳ Les services démarrent..." -ForegroundColor Green
Write-Host "Ouvrez http://localhost:5174 dans votre navigateur" -ForegroundColor Cyan
Write-Host "=" * 50