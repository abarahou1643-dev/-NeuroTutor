package com.neurotutor.user.service;

import com.neurotutor.user.dto.UserPreferencesRequest;
import com.neurotutor.user.dto.UserPreferencesResponse;
import com.neurotutor.user.exception.ResourceNotFoundException;
import com.neurotutor.user.model.User;
import com.neurotutor.user.model.UserPreferences;
import com.neurotutor.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserRepository userRepository;

    public UserPreferencesResponse getUserPreferences(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapToResponse(user.getPreferences());
    }

    @Transactional
    public UserPreferencesResponse updateUserPreferences(String userId, UserPreferencesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserPreferences preferences = user.getPreferences();
        if (preferences == null) {
            preferences = new UserPreferences();
            preferences.setUser(user);
            user.setPreferences(preferences);
        }

        // Update preferences from request
        request.updateUserPreferences(preferences);
        
        // Save the updated user (which will cascade to preferences)
        User updatedUser = userRepository.save(user);
        log.info("Updated preferences for user: {}", userId);
        
        return mapToResponse(updatedUser.getPreferences());
    }

    private UserPreferencesResponse mapToResponse(UserPreferences preferences) {
        if (preferences == null) {
            return UserPreferencesResponse.builder().build();
        }
        
        return UserPreferencesResponse.builder()
                .id(preferences.getId())
                .userId(preferences.getUser().getId())
                .theme(preferences.getTheme())
                .language(preferences.getLanguage())
                .emailNotifications(preferences.isEmailNotifications())
                .pushNotifications(preferences.isPushNotifications())
                .bio(preferences.getBio())
                .build();
    }
}
