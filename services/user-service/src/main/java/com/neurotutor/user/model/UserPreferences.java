package com.neurotutor.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Locale;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String theme = "light";
    
    private String language = "fr";
    
    private boolean emailNotifications = true;
    
    private boolean pushNotifications = true;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    // Méthodes utilitaires
    public Locale getLocale() {
        return new Locale(language);
    }
    
    public void setLocale(Locale locale) {
        this.language = locale.getLanguage();
    }
}
