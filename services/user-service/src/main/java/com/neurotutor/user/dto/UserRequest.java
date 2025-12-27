package com.neurotutor.user.dto;

import com.neurotutor.user.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    private String firstName;
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    private String lastName;
    
    @Size(max = 1000, message = "L'URL de l'avatar est trop longue")
    private String avatarUrl;
    
    private User.UserRole role;
    
    public User toUser() {
        return User.builder()
                .email(this.email)
                .firstName(this.firstName)
                .lastName(this.lastName)
                .avatarUrl(this.avatarUrl)
                .role(this.role != null ? this.role : User.UserRole.STUDENT)
                .build();
    }
    
    public void updateUser(User user) {
        if (this.email != null) user.setEmail(this.email);
        if (this.firstName != null) user.setFirstName(this.firstName);
        if (this.lastName != null) user.setLastName(this.lastName);
        if (this.avatarUrl != null) user.setAvatarUrl(this.avatarUrl);
        if (this.role != null) user.setRole(this.role);
    }
}
