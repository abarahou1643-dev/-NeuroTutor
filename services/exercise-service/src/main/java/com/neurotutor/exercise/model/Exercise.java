package com.neurotutor.exercise.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "exercises")
public class Exercise {

    @Id
    private String id;

    private String title;
    private String description;
    private String problemStatement;

    /**
     * BEGINNER / INTERMEDIATE / ADVANCED
     */
    private String difficulty;

    private List<String> topics;
    private List<String> tags;

    private String solution;

    private List<String> hints;
    private List<String> steps;

    /**
     * Ex: ["TEXT"] ou ["TEXT","IMAGE"]
     */
    private List<String> responseTypes;

    private String explanationText;

    // ✅ NEW FIELDS (aligné avec ton JSON)
    private Boolean stepsRequired;     // true = correction step-by-step obligatoire
    private String correctionMode;     // ex: "AUTO" / "AI" / "MANUAL"
    private Boolean allowImage;
    private Boolean allowAudio;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer estimatedTime;
    private Integer points;

    private Boolean isPublished;
    private Boolean isApproved;
}
