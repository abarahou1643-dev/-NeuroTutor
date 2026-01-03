package com.neurotutor.exercise.dto.ia;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiStepEvalRequest {

    @JsonProperty("exercise_id")
    private String exerciseId;

    @JsonProperty("student_id")
    private String studentId;

    @JsonProperty("expected_answer")
    private String expectedAnswer;

    @JsonProperty("steps")
    private List<String> steps;

    @JsonProperty("final_answer")
    private String finalAnswer;
}
