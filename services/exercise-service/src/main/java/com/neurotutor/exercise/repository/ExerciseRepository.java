package com.neurotutor.exercise.repository;

import com.neurotutor.exercise.model.Exercise;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends MongoRepository<Exercise, String> {

    List<Exercise> findByDifficulty(String difficulty);

    // ✅ Recherche par topic (ex: "Algèbre")
    List<Exercise> findByTopicsContaining(String topic);

    // ❌ SUPPRIMÉ car Exercise n’a pas createdBy
    // List<Exercise> findByCreatedBy(String createdBy);

    // ✅ Exercices publiés seulement
    List<Exercise> findByIsPublishedTrue();
}
