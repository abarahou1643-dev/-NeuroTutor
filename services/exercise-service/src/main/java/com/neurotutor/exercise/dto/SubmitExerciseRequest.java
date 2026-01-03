package com.neurotutor.exercise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExerciseRequest {

    private String userId;

    // ✅ mode simple
    private String answer;

    // ✅ mode step-by-step
    private List<String> steps;

    // ✅ réponse finale (optionnelle)
    private String finalAnswer;
}
