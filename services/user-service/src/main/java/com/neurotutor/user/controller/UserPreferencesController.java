package com.neurotutor.user.controller;

import com.neurotutor.user.dto.UserPreferencesRequest;
import com.neurotutor.user.dto.UserPreferencesResponse;
import com.neurotutor.user.service.UserPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/{userId}/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    @GetMapping
    public ResponseEntity<UserPreferencesResponse> getUserPreferences(@PathVariable String userId) {
        return ResponseEntity.ok(preferencesService.getUserPreferences(userId));
    }

    @PutMapping
    public ResponseEntity<UserPreferencesResponse> updateUserPreferences(
            @PathVariable String userId,
            @Valid @RequestBody UserPreferencesRequest request) {
        return ResponseEntity.ok(preferencesService.updateUserPreferences(userId, request));
    }

    @PutMapping("/theme")
    public ResponseEntity<UserPreferencesResponse> updateThemePreference(
            @PathVariable String userId,
            @RequestParam String theme) {
        UserPreferencesRequest request = new UserPreferencesRequest();
        request.setTheme(theme);
        return ResponseEntity.ok(preferencesService.updateUserPreferences(userId, request));
    }

    @PutMapping("/language")
    public ResponseEntity<UserPreferencesResponse> updateLanguagePreference(
            @PathVariable String userId,
            @RequestParam String language) {
        UserPreferencesRequest request = new UserPreferencesRequest();
        request.setLanguage(language);
        return ResponseEntity.ok(preferencesService.updateUserPreferences(userId, request));
    }
}
