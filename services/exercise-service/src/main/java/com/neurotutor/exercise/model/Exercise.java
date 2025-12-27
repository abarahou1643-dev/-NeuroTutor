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

    /**
     * ✅ solution attendue (ex: "x=5", "13", "3/4")
     */
    private String solution;

    /**
     * ✅ indices / étapes
     */
    private List<String> hints;
    private List<String> steps;

    /**
     * ✅ NEW : types de réponse acceptés
     * Ex: ["TEXT"] ou ["TEXT","IMAGE"] ou ["AUDIO"]
     */
    private List<String> responseTypes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer estimatedTime; // minutes
    private Integer points;

    private Boolean isPublished;
    private Boolean isApproved;
}
