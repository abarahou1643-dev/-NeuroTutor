package com.neurotutor.exercise.controller;

import com.neurotutor.exercise.dto.SubmitExerciseRequest;
import com.neurotutor.exercise.dto.SubmitExerciseResponse;
import com.neurotutor.exercise.model.Submission;
import com.neurotutor.exercise.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionService submissionService;

    // ✅ Envoi réponse (mode simple ou steps)
    @PostMapping("/{exerciseId}")
    public ResponseEntity<SubmitExerciseResponse> submit(
            @PathVariable String exerciseId,
            @RequestBody SubmitExerciseRequest request
    ) {
        return ResponseEntity.ok(submissionService.submit(exerciseId, request));
    }

    // ✅ IMPORTANT: dashboard -> récupérer les tentatives d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> listByUser(@PathVariable String userId) {
        return ResponseEntity.ok(submissionService.listByUser(userId));
    }

    // ✅ Optionnel: tentatives d’un user pour un exercice précis
    @GetMapping("/user/{userId}/exercise/{exerciseId}")
    public ResponseEntity<List<Submission>> listByUserAndExercise(
            @PathVariable String userId,
            @PathVariable String exerciseId
    ) {
        return ResponseEntity.ok(submissionService.listByUserAndExercise(userId, exerciseId));
    }
}
