// src/main/java/com/neurotutor/exercise/model/DiagnosticTest.java
package com.neurotutor.exercise.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "diagnostic_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticTest {
    @Id
    private String id;

    private String studentId;
    private List<Question> questions;
    private List<String> studentAnswers;
    private Result result;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String assignedLevel; // "BEGINNER", "INTERMEDIATE", "ADVANCED"
    private String status; // "IN_PROGRESS", "COMPLETED"

    // Classes internes publiques
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Question {
        private String id;
        private String questionText;
        private List<String> options;
        private String correctAnswer;
        private String topic;
        private String difficulty;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Result {
        private Integer totalQuestions;
        private Integer correctAnswers;
        private Double score;
        private String levelRecommendation;
        private List<TopicScore> topicScores;
        private List<String> recommendedTopics;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicScore {
        private String topic;
        private Double score;
        private String level;
    }
}