package com.neurotutor.exercise.repository;

import com.neurotutor.exercise.model.Exercise;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExerciseRepository extends MongoRepository<Exercise, String> {

    List<Exercise> findByDifficulty(String difficulty);

    List<Exercise> findByTopicsContaining(String topic);

    List<Exercise> findByDifficultyAndTopicsContaining(String difficulty, String topic);
}
