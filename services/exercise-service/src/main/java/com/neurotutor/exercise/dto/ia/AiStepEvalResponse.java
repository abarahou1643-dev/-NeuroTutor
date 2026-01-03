package com.neurotutor.exercise.dto.ia;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiStepEvalResponse {

    @JsonProperty("global_score")
    private double globalScore;

    @JsonProperty("steps_feedback")
    private List<StepFeedback> stepsFeedback;

    @JsonProperty("generated_solution_steps")
    private List<String> generatedSolutionSteps;

    @JsonProperty("correct_answer")
    private String correctAnswer;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepFeedback {

        @JsonProperty("index")
        private int index;

        @JsonProperty("step")
        private String step;

        // ✅ IMPORTANT: is_correct -> correct
        @JsonProperty("is_correct")
        private boolean correct;

        @JsonProperty("hint")
        private String hint;

        @JsonProperty("corrected_step")
        private String correctedStep;
    }
}
