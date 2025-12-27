package com.neurotutor.exercise.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    private String id;

    private String userId;
    private String exerciseId;

    private String answer;      // réponse donnée par l'étudiant
    private boolean correct;    // vrai/faux

    private int scoreEarned;    // ex: points si correct sinon 0
    private LocalDateTime submittedAt;
}
