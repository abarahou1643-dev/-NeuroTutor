package com.neurotutor.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiagnosticCompleteRequest {

    @NotNull
    private Integer score;

    @NotNull
    private String level; // BEGINNER / INTERMEDIATE / ADVANCED
}
