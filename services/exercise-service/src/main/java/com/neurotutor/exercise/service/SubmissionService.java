package com.neurotutor.exercise.service;

import com.neurotutor.exercise.dto.SubmitExerciseRequest;
import com.neurotutor.exercise.dto.SubmitExerciseResponse;
import com.neurotutor.exercise.model.Exercise;
import com.neurotutor.exercise.model.Submission;
import com.neurotutor.exercise.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ExerciseService exerciseService;

    // ✅ Normalisation robuste
    private String norm(String s) {
        if (s == null) return "";
        return s.toLowerCase()
                .replaceAll("\\s+", "")
                .replace(",", ".")
                .trim();
    }

    // ✅ Accepte: "5" == "x=5" == "=5"
    private boolean isCorrectAnswer(String userAnswer, String expected) {
        String u = norm(userAnswer);
        String e = norm(expected);

        if (u.isEmpty() || e.isEmpty()) return false;

        // enlever "=" au début si user écrit "=5"
        if (u.startsWith("=")) u = u.substring(1);

        // égalité directe
        if (u.equals(e)) return true;

        // expected: "x=5" et user: "5"
        if (e.contains("=")) {
            String rhs = e.substring(e.lastIndexOf("=") + 1);
            if (u.equals(rhs)) return true;

            // user: "x=5"
            if (u.contains("=")) {
                String urhs = u.substring(u.lastIndexOf("=") + 1);
                if (urhs.equals(rhs)) return true;
            }
        }

        // expected: "x=2 ou x=3"
        if (e.contains("ou")) {
            String[] parts = e.split("ou");
            for (String p : parts) {
                if (isCorrectAnswer(userAnswer, p)) return true;
            }
        }

        // expected: "5" et user: "x=5"
        if (u.contains("=") && !e.contains("=")) {
            String urhs = u.substring(u.lastIndexOf("=") + 1);
            return urhs.equals(e);
        }

        return false;
    }

    // ✅ POST /submissions/{exerciseId}
    public SubmitExerciseResponse submit(String exerciseId, SubmitExerciseRequest req) {
        Exercise exercise = exerciseService.getExerciseByIdOrThrow(exerciseId);

        boolean correct = isCorrectAnswer(req.getAnswer(), exercise.getSolution());

        int earned = 0;
        if (correct) earned = (exercise.getPoints() != null) ? exercise.getPoints() : 10;

        Submission sub = Submission.builder()
                .userId(req.getUserId())
                .exerciseId(exerciseId)
                .answer(req.getAnswer())
                .correct(correct)
                .scoreEarned(earned)
                .submittedAt(LocalDateTime.now())
                .build();

        Submission saved = submissionRepository.save(sub);

        return SubmitExerciseResponse.builder()
                .submissionId(saved.getId())
                .userId(saved.getUserId())
                .exerciseId(saved.getExerciseId())
                .answer(saved.getAnswer())
                .correct(saved.isCorrect())
                .scoreEarned(saved.getScoreEarned())
                .submittedAt(saved.getSubmittedAt())
                .build();
    }

    // ✅ GET /submissions/user/{userId}
    public List<Submission> getUserSubmissions(String userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }
}
