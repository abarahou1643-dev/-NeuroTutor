// src/main/java/com/neurotutor/exercise/controller/DiagnosticController.java
package com.neurotutor.exercise.controller;

import com.neurotutor.exercise.model.DiagnosticTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/diagnostic")
@CrossOrigin(origins = "*")
public class DiagnosticController {

    // Questions diagnostiques prédéfinies
    private final List<DiagnosticTest.Question> DEFAULT_QUESTIONS = Arrays.asList(
            DiagnosticTest.Question.builder()
                    .id("q1")
                    .questionText("Résolvez : 2x + 5 = 13")
                    .options(Arrays.asList("x = 4", "x = 3", "x = 5", "x = 6"))
                    .correctAnswer("x = 4")
                    .topic("Algèbre")
                    .difficulty("EASY")
                    .build(),
            DiagnosticTest.Question.builder()
                    .id("q2")
                    .questionText("Quelle est l'aire d'un rectangle de longueur 8 cm et largeur 5 cm ?")
                    .options(Arrays.asList("13 cm²", "40 cm²", "26 cm²", "45 cm²"))
                    .correctAnswer("40 cm²")
                    .topic("Géométrie")
                    .difficulty("EASY")
                    .build(),
            DiagnosticTest.Question.builder()
                    .id("q3")
                    .questionText("Factorisez : x² - 9")
                    .options(Arrays.asList("(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "x(x-9)"))
                    .correctAnswer("(x-3)(x+3)")
                    .topic("Algèbre")
                    .difficulty("MEDIUM")
                    .build(),
            DiagnosticTest.Question.builder()
                    .id("q4")
                    .questionText("Quelle est la dérivée de f(x) = 3x² + 2x ?")
                    .options(Arrays.asList("6x + 2", "3x + 2", "6x² + 2", "3x² + 2"))
                    .correctAnswer("6x + 2")
                    .topic("Calcul")
                    .difficulty("MEDIUM")
                    .build(),
            DiagnosticTest.Question.builder()
                    .id("q5")
                    .questionText("Résolvez le système : { 2x + y = 8, x - y = 1 }")
                    .options(Arrays.asList("x=3, y=2", "x=2, y=4", "x=4, y=0", "x=3, y=5"))
                    .correctAnswer("x=3, y=2")
                    .topic("Algèbre")
                    .difficulty("HARD")
                    .build()
    );

    // In-memory storage pour les tests
    private Map<String, DiagnosticTest> diagnosticTests = new HashMap<>();

    @PostMapping("/start")
    public ResponseEntity<DiagnosticTest> startDiagnostic(@RequestBody Map<String, String> request) {
        String studentId = request.get("studentId");

        if (studentId == null || studentId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Sélectionner 5 questions aléatoires
        List<DiagnosticTest.Question> selectedQuestions = selectRandomQuestions(5);

        DiagnosticTest test = DiagnosticTest.builder()
                .id(UUID.randomUUID().toString())
                .studentId(studentId)
                .questions(selectedQuestions)
                .studentAnswers(new ArrayList<>())
                .startedAt(LocalDateTime.now())
                .status("IN_PROGRESS")
                .build();

        diagnosticTests.put(test.getId(), test);

        System.out.println("✅ Test diagnostique démarré pour étudiant: " + studentId);
        System.out.println("📝 Test ID: " + test.getId());
        System.out.println("❓ Questions: " + selectedQuestions.size());

        return ResponseEntity.ok(test);
    }

    @PostMapping("/submit/{testId}")
    public ResponseEntity<DiagnosticTest.Result> submitDiagnostic(
            @PathVariable String testId,
            @RequestBody Map<String, Object> submission) {

        DiagnosticTest test = diagnosticTests.get(testId);

        if (test == null) {
            System.err.println("❌ Test non trouvé: " + testId);
            return ResponseEntity.notFound().build();
        }

        @SuppressWarnings("unchecked")
        List<String> answers = (List<String>) submission.get("answers");
        String studentId = (String) submission.get("studentId");

        if (!test.getStudentId().equals(studentId)) {
            System.err.println("❌ ID étudiant ne correspond pas");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        System.out.println("📤 Soumission test ID: " + testId);
        System.out.println("👤 Étudiant: " + studentId);
        System.out.println("📝 Réponses reçues: " + answers.size());

        test.setStudentAnswers(answers);
        test.setCompletedAt(LocalDateTime.now());
        test.setStatus("COMPLETED");

        // Évaluer les réponses
        DiagnosticTest.Result result = evaluateDiagnostic(test);
        test.setResult(result);
        test.setAssignedLevel(result.getLevelRecommendation());

        System.out.println("✅ Test évalué - Score: " + result.getScore() * 100 + "%");
        System.out.println("🎯 Niveau recommandé: " + result.getLevelRecommendation());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/result/{studentId}")
    public ResponseEntity<DiagnosticTest.Result> getDiagnosticResult(@PathVariable String studentId) {
        DiagnosticTest test = findLatestTestByStudent(studentId);

        if (test == null || test.getResult() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(test.getResult());
    }

    // Méthodes utilitaires
    private List<DiagnosticTest.Question> selectRandomQuestions(int count) {
        Collections.shuffle(DEFAULT_QUESTIONS);
        return DEFAULT_QUESTIONS.subList(0, Math.min(count, DEFAULT_QUESTIONS.size()));
    }

    private DiagnosticTest.Result evaluateDiagnostic(DiagnosticTest test) {
        List<DiagnosticTest.Question> questions = test.getQuestions();
        List<String> answers = test.getStudentAnswers();

        int correctCount = 0;
        Map<String, Integer> topicCorrect = new HashMap<>();
        Map<String, Integer> topicTotal = new HashMap<>();

        for (int i = 0; i < questions.size(); i++) {
            DiagnosticTest.Question q = questions.get(i);
            String answer = i < answers.size() ? answers.get(i) : null;

            if (q.getCorrectAnswer().equals(answer)) {
                correctCount++;
                topicCorrect.put(q.getTopic(), topicCorrect.getOrDefault(q.getTopic(), 0) + 1);
            }
            topicTotal.put(q.getTopic(), topicTotal.getOrDefault(q.getTopic(), 0) + 1);
        }

        // Calculer les scores par topic
        List<DiagnosticTest.TopicScore> topicScores = new ArrayList<>();
        for (String topic : topicTotal.keySet()) {
            int correct = topicCorrect.getOrDefault(topic, 0);
            int total = topicTotal.get(topic);
            double score = total > 0 ? (double) correct / total : 0.0;

            String level = score >= 0.7 ? "STRONG" : score >= 0.4 ? "AVERAGE" : "WEAK";

            topicScores.add(DiagnosticTest.TopicScore.builder()
                    .topic(topic)
                    .score(score)
                    .level(level)
                    .build());
        }

        // Score global
        double overallScore = questions.size() > 0 ? (double) correctCount / questions.size() : 0.0;

        // Déterminer le niveau recommandé
        String levelRecommendation = determineLevel(overallScore, topicScores);

        // Recommander des topics à améliorer
        List<String> recommendedTopics = topicScores.stream()
                .filter(ts -> ts.getLevel().equals("WEAK"))
                .map(DiagnosticTest.TopicScore::getTopic)
                .toList();

        return DiagnosticTest.Result.builder()
                .totalQuestions(questions.size())
                .correctAnswers(correctCount)
                .score(overallScore)
                .levelRecommendation(levelRecommendation)
                .topicScores(topicScores)
                .recommendedTopics(recommendedTopics)
                .build();
    }

    private String determineLevel(double overallScore, List<DiagnosticTest.TopicScore> topicScores) {
        // Règles de classification
        if (overallScore >= 0.8) {
            return "ADVANCED";
        } else if (overallScore >= 0.5) {
            long weakTopics = topicScores.stream()
                    .filter(ts -> ts.getLevel().equals("WEAK"))
                    .count();
            return weakTopics >= 2 ? "BEGINNER" : "INTERMEDIATE";
        } else {
            return "BEGINNER";
        }
    }

    private DiagnosticTest findLatestTestByStudent(String studentId) {
        return diagnosticTests.values().stream()
                .filter(t -> t.getStudentId().equals(studentId))
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .max(Comparator.comparing(DiagnosticTest::getCompletedAt))
                .orElse(null);
    }

    @GetMapping("/test/{testId}")
    public ResponseEntity<DiagnosticTest> getTest(@PathVariable String testId) {
        DiagnosticTest test = diagnosticTests.get(testId);
        return test != null ? ResponseEntity.ok(test) : ResponseEntity.notFound().build();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("service", "diagnostic-service");
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("questions_available", String.valueOf(DEFAULT_QUESTIONS.size()));
        response.put("active_tests", String.valueOf(diagnosticTests.size()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/questions")
    public ResponseEntity<List<DiagnosticTest.Question>> getAllQuestions() {
        return ResponseEntity.ok(DEFAULT_QUESTIONS);
    }
}