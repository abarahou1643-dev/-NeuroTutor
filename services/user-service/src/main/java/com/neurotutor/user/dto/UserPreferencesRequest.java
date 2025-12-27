package com.neurotutor.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserPreferencesRequest {
    private String theme;
    private String language;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private String bio;
    
    public void updateUserPreferences(com.neurotutor.user.model.UserPreferences preferences) {
        if (this.theme != null) {
            preferences.setTheme(this.theme);
        }
        if (this.language != null) {
            preferences.setLanguage(this.language);
        }
        if (this.emailNotifications != null) {
            preferences.setEmailNotifications(this.emailNotifications);
        }
        if (this.pushNotifications != null) {
            preferences.setPushNotifications(this.pushNotifications);
        }
        if (this.bio != null) {
            preferences.setBio(this.bio);
        }
    }
}
