package com.neurotutor.exercise.repository;

import com.neurotutor.exercise.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByUserIdOrderBySubmittedAtDesc(String userId);
    List<Submission> findByUserIdAndExerciseId(String userId, String exerciseId);
}
