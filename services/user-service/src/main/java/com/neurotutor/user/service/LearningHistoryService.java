package com.neurotutor.user.service;

import com.neurotutor.user.dto.LearningHistoryRequest;
import com.neurotutor.user.dto.LearningHistoryResponse;
import com.neurotutor.user.exception.ResourceNotFoundException;
import com.neurotutor.user.model.LearningHistory;
import com.neurotutor.user.model.User;
import com.neurotutor.user.repository.LearningHistoryRepository;
import com.neurotutor.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningHistoryService {

    private final LearningHistoryRepository learningHistoryRepository;
    private final UserRepository userRepository;

    public Page<LearningHistoryResponse> getUserLearningHistory(String userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return learningHistoryRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public LearningHistoryResponse addLearningHistory(String userId, LearningHistoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LearningHistory history = request.toLearningHistory();
        history.setUser(user);
        
        LearningHistory savedHistory = learningHistoryRepository.save(history);
        log.info("Added learning history for user: {}, exercise: {}", userId, request.getExerciseId());
        
        return mapToResponse(savedHistory);
    }

    public LearningHistoryResponse getLearningHistoryEntry(String userId, Long historyId) {
        LearningHistory history = learningHistoryRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Learning history not found with id: " + historyId + " for user: " + userId));
        
        return mapToResponse(history);
    }

    @Transactional
    public LearningHistoryResponse updateLearningHistory(
            String userId, 
            Long historyId, 
            LearningHistoryRequest request) {
        
        LearningHistory history = learningHistoryRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Learning history not found with id: " + historyId + " for user: " + userId));
        
        // Update fields from request
        history.setExerciseId(request.getExerciseId());
        history.setExerciseTitle(request.getExerciseTitle());
        history.setScore(request.getScore());
        history.setTimeSpentSeconds(request.getTimeSpentSeconds());
        history.setCompleted(request.getCompleted());
        history.setNotes(request.getNotes());
        
        LearningHistory updatedHistory = learningHistoryRepository.save(history);
        log.info("Updated learning history: {} for user: {}", historyId, userId);
        
        return mapToResponse(updatedHistory);
    }

    @Transactional
    public void deleteLearningHistory(String userId, Long historyId) {
        if (!learningHistoryRepository.existsByIdAndUserId(historyId, userId)) {
            throw new ResourceNotFoundException(
                    "Learning history not found with id: " + historyId + " for user: " + userId);
        }
        
        learningHistoryRepository.deleteById(historyId);
        log.info("Deleted learning history: {} for user: {}", historyId, userId);
    }

    public LearningHistoryResponse getLearningHistoryForExercise(String userId, String exerciseId) {
        return learningHistoryRepository.findByUserIdAndExerciseId(userId, exerciseId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No learning history found for user: " + userId + " and exercise: " + exerciseId));
    }

    private LearningHistoryResponse mapToResponse(LearningHistory history) {
        return LearningHistoryResponse.builder()
                .id(history.getId())
                .userId(history.getUser().getId())
                .exerciseId(history.getExerciseId())
                .exerciseTitle(history.getExerciseTitle())
                .score(history.getScore())
                .timeSpentSeconds(history.getTimeSpentSeconds())
                .completed(history.isCompleted())
                .notes(history.getNotes())
                .completedAt(history.getCompletedAt())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
