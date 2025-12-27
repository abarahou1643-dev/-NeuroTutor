package com.neurotutor.auth.dto;

import com.neurotutor.auth.model.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @Email(message = "Email invalide")
    @NotBlank(message = "Email requis")
    private String email;

    @NotBlank(message = "Mot de passe requis")
    private String password;

    @NotBlank(message = "Prénom requis")
    private String firstName;

    @NotBlank(message = "Nom requis")
    private String lastName;

    private UserRole role;

    private String schoolId;
    private String classId;
}