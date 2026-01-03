package com.neurotutor.exercise.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    private String id;

    // 🔑 Utilisateur
    private String userId;

    // 📘 Exercice concerné
    private String exerciseId;

    // ✅ Réponse finale (texte)
    private String answer;

    // ✅ NEW: étapes envoyées par l’élève
    private List<String> steps;

    // ✅ NEW: finalAnswer explicite (si fourni)
    private String finalAnswer;

    // ✅ Résultat global (sur la réponse finale)
    private boolean correct;

    // ⭐ Points gagnés
    private int scoreEarned;

    // 🕒 Date de soumission
    private LocalDateTime submittedAt;

    // 🖼️ Image explicative (optionnelle)
    private String imageUrl;

    // 🎤 Audio explicatif (optionnel)
    private String audioUrl;

    // ✅ NEW: score IA global (optionnel)
    private Double aiGlobalScore;
}
