# Script pour ajouter des exercices de test à MongoDB
$exercises = @(
    @{
        title = "Addition simple"
        description = "Résolvez cette addition simple"
        problemStatement = "Quel est le résultat de 2 + 2 ?"
        difficulty = "BEGINNER"
        solution = "4"
        hints = @("Pensez à additionner les deux nombres")
        topics = @("Mathématiques", "Addition")
        tags = @("débutant", "maths")
        isPublished = $true
        isApproved = $true
    },
    @{
        title = "Soustraction"
        description = "Résolvez cette soustraction"
        problemStatement = "Quel est le résultat de 10 - 4 ?"
        difficulty = "BEGINNER"
        solution = "6"
        hints = @("Soustraire le deuxième nombre du premier")
        topics = @("Mathématiques", "Soustraction")
        tags = @("débutant", "maths")
        isPublished = $true
        isApproved = $true
    },
    @{
        title = "Multiplication"
        description = "Résolvez cette multiplication"
        problemStatement = "Quel est le résultat de 7 * 3 ?"
        difficulty = "INTERMEDIATE"
        solution = "21"
        hints = @("Multipliez les deux nombres")
        topics = @("Mathématiques", "Multiplication")
        tags = @("intermédiaire", "maths")
        isPublished = $true
        isApproved = $true
    }
)

# URL de l'API
$apiUrl = "http://localhost:8083/api/v1/exercises"

# Ajouter chaque exercice
foreach ($ex in $exercises) {
    $body = $ex | ConvertTo-Json
    Write-Host "Ajout de l'exercice: $($ex.title)"
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
        Write-Host "  ✓ Succès - ID: $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "
Vérification des exercices ajoutés..."
$allExercises = Invoke-RestMethod -Uri $apiUrl -Method Get
$allExercises | Format-Table id, title, difficulty -AutoSize
