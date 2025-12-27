package com.neurotutor.user.controller;

import com.neurotutor.user.dto.LearningHistoryRequest;
import com.neurotutor.user.dto.LearningHistoryResponse;
import com.neurotutor.user.service.LearningHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/{userId}/history")
@RequiredArgsConstructor
public class LearningHistoryController {

    private final LearningHistoryService learningHistoryService;

    @GetMapping
    public ResponseEntity<Page<LearningHistoryResponse>> getUserLearningHistory(
            @PathVariable String userId,
            Pageable pageable) {
        return ResponseEntity.ok(learningHistoryService.getUserLearningHistory(userId, pageable));
    }

    @PostMapping
    public ResponseEntity<LearningHistoryResponse> addLearningHistory(
            @PathVariable String userId,
            @Valid @RequestBody LearningHistoryRequest request) {
        return ResponseEntity.ok(learningHistoryService.addLearningHistory(userId, request));
    }

    @GetMapping("/{historyId}")
    public ResponseEntity<LearningHistoryResponse> getLearningHistoryEntry(
            @PathVariable String userId,
            @PathVariable Long historyId) {
        return ResponseEntity.ok(learningHistoryService.getLearningHistoryEntry(userId, historyId));
    }

    @PutMapping("/{historyId}")
    public ResponseEntity<LearningHistoryResponse> updateLearningHistory(
            @PathVariable String userId,
            @PathVariable Long historyId,
            @Valid @RequestBody LearningHistoryRequest request) {
        return ResponseEntity.ok(
                learningHistoryService.updateLearningHistory(userId, historyId, request));
    }

    @DeleteMapping("/{historyId}")
    public ResponseEntity<Void> deleteLearningHistory(
            @PathVariable String userId,
            @PathVariable Long historyId) {
        learningHistoryService.deleteLearningHistory(userId, historyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<LearningHistoryResponse> getLearningHistoryForExercise(
            @PathVariable String userId,
            @PathVariable String exerciseId) {
        return ResponseEntity.ok(
                learningHistoryService.getLearningHistoryForExercise(userId, exerciseId));
    }
}
