package com.neurotutor.exercise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OcrRequest {
    private String text;

    @JsonProperty("image_base64")
    private String imageBase64;
}
