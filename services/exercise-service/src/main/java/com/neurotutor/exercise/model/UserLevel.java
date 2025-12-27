package com.neurotutor.exercise.model;

import java.util.Comparator;

public enum UserLevel {
    BEGINNER(1),
    INTERMEDIATE(2),
    ADVANCED(3);

    private final int levelValue;

    UserLevel(int levelValue) {
        this.levelValue = levelValue;
    }

    public boolean canAccess(UserLevel requiredLevel) {
        return this.levelValue >= requiredLevel.levelValue;
    }

    public static UserLevel fromString(String level) {
        if (level == null) {
            return BEGINNER; // Niveau par défaut
        }
        try {
            return UserLevel.valueOf(level.toUpperCase());
        } catch (IllegalArgumentException e) {
            return BEGINNER; // Niveau par défaut en cas d'erreur
        }
    }
}
