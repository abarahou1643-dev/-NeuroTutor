package com.neurotutor.exercise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OcrResponse {
    private String text;
    private String latex;
    private Double confidence;
    private Boolean success;

    @JsonProperty("is_math")
    private Boolean isMath;
}
