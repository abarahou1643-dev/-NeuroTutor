package com.neurotutor.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LearningHistoryRequest {
    
    @NotBlank(message = "L'ID de l'exercice est obligatoire")
    private String exerciseId;
    
    @NotBlank(message = "Le titre de l'exercice est obligatoire")
    private String exerciseTitle;
    
    @Min(value = 0, message = "Le score ne peut pas être négatif")
    @Max(value = 100, message = "Le score maximum est de 100")
    private int score;
    
    @Min(value = 0, message = "Le temps passé ne peut pas être négatif")
    private int timeSpentSeconds;
    
    @NotNull(message = "L'état d'achèvement est obligatoire")
    private Boolean completed;
    
    private String notes;
    
    public com.neurotutor.user.model.LearningHistory toLearningHistory() {
        com.neurotutor.user.model.LearningHistory history = new com.neurotutor.user.model.LearningHistory();
        history.setExerciseId(this.exerciseId);
        history.setExerciseTitle(this.exerciseTitle);
        history.setScore(this.score);
        history.setTimeSpentSeconds(this.timeSpentSeconds);
        history.setCompleted(this.completed);
        history.setNotes(this.notes);
        return history;
    }
}
