package com.neurotutor.exercise.controller;

import com.neurotutor.exercise.model.Exercise;
import com.neurotutor.exercise.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    // ✅ LIST: /api/v1/exercises?difficulty=...&topic=...
    @GetMapping
    public Map<String, Object> listExercises(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic
    ) {
        List<Exercise> exercises;

        if (difficulty != null && topic != null) {
            exercises = exerciseRepository.findByDifficultyAndTopicsContaining(difficulty, topic);
        } else if (difficulty != null) {
            exercises = exerciseRepository.findByDifficulty(difficulty);
        } else if (topic != null) {
            exercises = exerciseRepository.findByTopicsContaining(topic);
        } else {
            exercises = exerciseRepository.findAll();
        }

        return Map.of(
                "value", exercises,
                "Count", exercises.size()
        );
    }

    // ✅ FIX 404: /api/v1/exercises/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable String id) {
        return exerciseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
