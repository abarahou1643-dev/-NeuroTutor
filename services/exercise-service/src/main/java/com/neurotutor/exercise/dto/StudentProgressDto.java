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
public class StudentProgressDto {
    private String userId;
    private long totalSubmissions;
    private long correctSubmissions;
    private int totalScore;
    private LocalDateTime lastSubmissionAt;
}
