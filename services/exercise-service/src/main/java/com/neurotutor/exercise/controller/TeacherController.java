package com.neurotutor.exercise.controller;

import com.neurotutor.exercise.dto.StudentProgressDto;
import com.neurotutor.exercise.model.Exercise;
import com.neurotutor.exercise.service.ExerciseService;
import com.neurotutor.exercise.service.TeacherProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final ExerciseService exerciseService;
    private final TeacherProgressService teacherProgressService;

    // ✅ CREATE exercise
    @PostMapping("/exercises")
    public ResponseEntity<Exercise> create(@RequestBody Exercise body) {
        return ResponseEntity.ok(exerciseService.createExercise(body));
    }

    // ✅ UPDATE exercise
    @PutMapping("/exercises/{id}")
    public ResponseEntity<Exercise> update(@PathVariable String id, @RequestBody Exercise patch) {
        return ResponseEntity.ok(exerciseService.updateExercise(id, patch));
    }

    // ✅ DELETE exercise
    @DeleteMapping("/exercises/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Progress student
    @GetMapping("/students/{userId}/progress")
    public ResponseEntity<StudentProgressDto> progress(@PathVariable String userId) {
        return ResponseEntity.ok(teacherProgressService.getProgress(userId));
    }
}
