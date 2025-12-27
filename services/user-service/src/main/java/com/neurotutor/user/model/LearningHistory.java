package com.neurotutor.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "learning_history")
public class LearningHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String exerciseId;
    
    @Column(nullable = false)
    private String exerciseTitle;
    
    private int score;
    
    private int timeSpentSeconds;
    
    private boolean completed;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(nullable = false)
    private LocalDateTime completedAt;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    // Méthodes utilitaires
    public static LearningHistory createFromExercise(String exerciseId, String exerciseTitle) {
        return LearningHistory.builder()
                .exerciseId(exerciseId)
                .exerciseTitle(exerciseTitle)
                .completedAt(LocalDateTime.now())
                .completed(false)
                .build();
    }
    
    public void complete(int score, int timeSpentSeconds, String notes) {
        this.score = score;
        this.timeSpentSeconds = timeSpentSeconds;
        this.completed = true;
        this.notes = notes;
        this.completedAt = LocalDateTime.now();
    }
}
