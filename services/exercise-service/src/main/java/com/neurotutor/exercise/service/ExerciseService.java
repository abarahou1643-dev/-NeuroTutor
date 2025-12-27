package com.neurotutor.exercise.service;

import com.neurotutor.exercise.model.Exercise;
import com.neurotutor.exercise.model.UserLevel;
import com.neurotutor.exercise.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    // ✅ GET all (avec filtre niveau)
    public List<Exercise> getAllExercises(String userLevel) {
        System.out.println("Getting exercises for user level: " + userLevel);

        List<Exercise> allExercises = exerciseRepository.findAll();

        if (userLevel == null || userLevel.isBlank()) {
            System.out.println("No user level specified, returning all " + allExercises.size() + " exercises");
            return allExercises;
        }

        UserLevel userLevelEnum = UserLevel.fromString(userLevel);

        List<Exercise> filteredExercises = allExercises.stream()
                .filter(exercise -> {
                    try {
                        UserLevel exerciseLevel = UserLevel.fromString(exercise.getDifficulty());
                        return userLevelEnum.canAccess(exerciseLevel);
                    } catch (Exception e) {
                        System.err.println("Error checking exercise access for level "
                                + exercise.getDifficulty() + ": " + e.getMessage());
                        return true;
                    }
                })
                .collect(Collectors.toList());

        System.out.println("Found " + filteredExercises.size() + " accessible exercises out of " + allExercises.size());
        return filteredExercises;
    }

    public Optional<Exercise> getExerciseById(String id) {
        System.out.println("Getting exercise by ID: " + id);
        return exerciseRepository.findById(id);
    }

    public Exercise getExerciseByIdOrThrow(String id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + id));
    }

    // ✅ CREATE 1
    public Exercise createExercise(Exercise exercise) {
        if (exercise == null) throw new IllegalArgumentException("Exercise body is required");
        if (exercise.getTitle() == null || exercise.getTitle().trim().isEmpty())
            throw new IllegalArgumentException("Title is required");

        // defaults
        if (exercise.getDifficulty() == null || exercise.getDifficulty().trim().isEmpty())
            exercise.setDifficulty("BEGINNER");

        if (exercise.getTopics() == null) exercise.setTopics(new ArrayList<>());
        if (exercise.getTags() == null) exercise.setTags(new ArrayList<>());
        if (exercise.getHints() == null) exercise.setHints(new ArrayList<>());
        if (exercise.getSteps() == null) exercise.setSteps(new ArrayList<>());

        // ✅ responseTypes default
        if (exercise.getResponseTypes() == null || exercise.getResponseTypes().isEmpty()) {
            exercise.setResponseTypes(List.of("TEXT"));
        }

        // Mongo id auto
        exercise.setId(null);

        LocalDateTime now = LocalDateTime.now();
        if (exercise.getCreatedAt() == null) exercise.setCreatedAt(now);
        exercise.setUpdatedAt(now);

        if (exercise.getEstimatedTime() == null) exercise.setEstimatedTime(5);
        if (exercise.getPoints() == null) exercise.setPoints(10);

        if (exercise.getIsPublished() == null) exercise.setIsPublished(false);
        if (exercise.getIsApproved() == null) exercise.setIsApproved(false);

        return exerciseRepository.save(exercise);
    }

    // ✅ BULK CREATE
    public List<Exercise> bulkCreate(List<Exercise> exercises) {
        if (exercises == null || exercises.isEmpty()) {
            throw new IllegalArgumentException("Exercises list is required");
        }

        List<Exercise> toSave = new ArrayList<>();

        for (Exercise ex : exercises) {
            if (ex == null) continue;

            if (ex.getTitle() == null || ex.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Title is required in one of exercises");
            }

            if (ex.getDifficulty() == null || ex.getDifficulty().trim().isEmpty()) {
                ex.setDifficulty("BEGINNER");
            }

            if (ex.getTopics() == null) ex.setTopics(new ArrayList<>());
            if (ex.getTags() == null) ex.setTags(new ArrayList<>());
            if (ex.getHints() == null) ex.setHints(new ArrayList<>());
            if (ex.getSteps() == null) ex.setSteps(new ArrayList<>());

            // ✅ default responseTypes
            if (ex.getResponseTypes() == null || ex.getResponseTypes().isEmpty()) {
                ex.setResponseTypes(List.of("TEXT"));
            }

            ex.setId(null);

            LocalDateTime now = LocalDateTime.now();
            if (ex.getCreatedAt() == null) ex.setCreatedAt(now);
            ex.setUpdatedAt(now);

            if (ex.getEstimatedTime() == null) ex.setEstimatedTime(5);
            if (ex.getPoints() == null) ex.setPoints(10);

            if (ex.getIsPublished() == null) ex.setIsPublished(false);
            if (ex.getIsApproved() == null) ex.setIsApproved(false);

            toSave.add(ex);
        }

        return exerciseRepository.saveAll(toSave);
    }
}
