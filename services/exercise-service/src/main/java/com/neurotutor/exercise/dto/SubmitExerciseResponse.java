package com.neurotutor.exercise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExerciseResponse {

    private String submissionId;
    private String userId;
    private String exerciseId;

    private String answer;
    private boolean correct;
    private int scoreEarned;

    private LocalDateTime submittedAt;

    private String imageUrl;
    private String audioUrl;

    // ✅ NEW
    private List<StepFeedback> stepsFeedback;
    private List<String> generatedSolutionSteps;

    private Double aiGlobalScore;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepFeedback {
        private int index;
        private String step;
        private boolean correct;
        private String hint;
        private String correctedStep;
    }
}
