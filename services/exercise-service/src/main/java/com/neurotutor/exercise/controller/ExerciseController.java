package com.neurotutor.exercise.controller;

import com.neurotutor.exercise.model.Exercise;
import com.neurotutor.exercise.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExerciseController {

    private final ExerciseService exerciseService;

    // ✅ GET /api/v1/exercises?level=BEGINNER
    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises(
            @RequestParam(value = "level", required = false) String userLevel
    ) {
        return ResponseEntity.ok(exerciseService.getAllExercises(userLevel));
    }

    // ✅ GET /api/v1/exercises/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable String id) {
        return exerciseService.getExerciseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST /api/v1/exercises
    @PostMapping
    public ResponseEntity<?> createExercise(@RequestBody Exercise exercise) {
        try {
            Exercise saved = exerciseService.createExercise(exercise);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ POST /api/v1/exercises/bulk
    @PostMapping("/bulk")
    public ResponseEntity<?> bulkCreate(@RequestBody List<Exercise> exercises) {
        try {
            return ResponseEntity.ok(exerciseService.bulkCreate(exercises));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
