package com.neurotutor.auth.dto;

import com.neurotutor.auth.model.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String schoolId;
    private String classId;
}