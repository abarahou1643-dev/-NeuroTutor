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

    public List<Exercise> getAllExercises(String userLevel) {
        List<Exercise> allExercises = exerciseRepository.findAll();

        if (userLevel == null || userLevel.isBlank()) return allExercises;

        UserLevel userLevelEnum = UserLevel.fromString(userLevel);

        return allExercises.stream()
                .filter(exercise -> {
                    try {
                        UserLevel exerciseLevel = UserLevel.fromString(exercise.getDifficulty());
                        return userLevelEnum.canAccess(exerciseLevel);
                    } catch (Exception e) {
                        return true;
                    }
                })
                .collect(Collectors.toList());
    }

    public Optional<Exercise> getExerciseById(String id) {
        return exerciseRepository.findById(id);
    }

    public Exercise getExerciseByIdOrThrow(String id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + id));
    }

    public Exercise createExercise(Exercise exercise) {
        if (exercise == null) throw new IllegalArgumentException("Exercise body is required");
        if (exercise.getTitle() == null || exercise.getTitle().trim().isEmpty())
            throw new IllegalArgumentException("Title is required");

        if (exercise.getDifficulty() == null || exercise.getDifficulty().trim().isEmpty())
            exercise.setDifficulty("BEGINNER");

        if (exercise.getTopics() == null) exercise.setTopics(new ArrayList<>());
        if (exercise.getTags() == null) exercise.setTags(new ArrayList<>());
        if (exercise.getHints() == null) exercise.setHints(new ArrayList<>());
        if (exercise.getSteps() == null) exercise.setSteps(new ArrayList<>());

        if (exercise.getResponseTypes() == null || exercise.getResponseTypes().isEmpty()) {
            exercise.setResponseTypes(List.of("TEXT"));
        }

        if (exercise.getExplanationText() == null) exercise.setExplanationText("");

        // ✅ defaults NEW fields
        if (exercise.getStepsRequired() == null) exercise.setStepsRequired(false);
        if (exercise.getCorrectionMode() == null || exercise.getCorrectionMode().isBlank())
            exercise.setCorrectionMode("AUTO");

        if (exercise.getAllowImage() == null)
            exercise.setAllowImage(exercise.getResponseTypes().contains("IMAGE"));

        if (exercise.getAllowAudio() == null)
            exercise.setAllowAudio(exercise.getResponseTypes().contains("AUDIO"));

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

    public Exercise updateExercise(String id, Exercise patch) {
        Exercise ex = getExerciseByIdOrThrow(id);

        if (patch.getTitle() != null) ex.setTitle(patch.getTitle());
        if (patch.getDescription() != null) ex.setDescription(patch.getDescription());
        if (patch.getProblemStatement() != null) ex.setProblemStatement(patch.getProblemStatement());

        if (patch.getDifficulty() != null) ex.setDifficulty(patch.getDifficulty());
        if (patch.getTopics() != null) ex.setTopics(patch.getTopics());
        if (patch.getTags() != null) ex.setTags(patch.getTags());

        if (patch.getSolution() != null) ex.setSolution(patch.getSolution());
        if (patch.getHints() != null) ex.setHints(patch.getHints());
        if (patch.getSteps() != null) ex.setSteps(patch.getSteps());

        if (patch.getResponseTypes() != null) ex.setResponseTypes(patch.getResponseTypes());
        if (patch.getEstimatedTime() != null) ex.setEstimatedTime(patch.getEstimatedTime());
        if (patch.getPoints() != null) ex.setPoints(patch.getPoints());

        if (patch.getIsPublished() != null) ex.setIsPublished(patch.getIsPublished());
        if (patch.getIsApproved() != null) ex.setIsApproved(patch.getIsApproved());

        if (patch.getExplanationText() != null) ex.setExplanationText(patch.getExplanationText());

        // ✅ update NEW fields
        if (patch.getStepsRequired() != null) ex.setStepsRequired(patch.getStepsRequired());
        if (patch.getCorrectionMode() != null) ex.setCorrectionMode(patch.getCorrectionMode());
        if (patch.getAllowImage() != null) ex.setAllowImage(patch.getAllowImage());
        if (patch.getAllowAudio() != null) ex.setAllowAudio(patch.getAllowAudio());

        ex.setUpdatedAt(LocalDateTime.now());
        return exerciseRepository.save(ex);
    }

    public void deleteExercise(String id) {
        Exercise ex = getExerciseByIdOrThrow(id);
        exerciseRepository.delete(ex);
    }

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

            if (ex.getResponseTypes() == null || ex.getResponseTypes().isEmpty()) {
                ex.setResponseTypes(List.of("TEXT"));
            }

            if (ex.getExplanationText() == null) ex.setExplanationText("");

            if (ex.getStepsRequired() == null) ex.setStepsRequired(false);
            if (ex.getCorrectionMode() == null || ex.getCorrectionMode().isBlank())
                ex.setCorrectionMode("AUTO");

            if (ex.getAllowImage() == null)
                ex.setAllowImage(ex.getResponseTypes().contains("IMAGE"));

            if (ex.getAllowAudio() == null)
                ex.setAllowAudio(ex.getResponseTypes().contains("AUDIO"));

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
