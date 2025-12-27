package com.neurotutor.exercise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
}
