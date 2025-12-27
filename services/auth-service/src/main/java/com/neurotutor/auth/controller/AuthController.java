package com.neurotutor.auth.controller;

import com.neurotutor.auth.JwtService;
import com.neurotutor.auth.dto.AuthRequest;
import com.neurotutor.auth.dto.AuthResponse;
import com.neurotutor.auth.dto.DiagnosticCompleteRequest;
import com.neurotutor.auth.dto.RegisterRequest;
import com.neurotutor.auth.model.User;
import com.neurotutor.auth.repository.UserRepository;
import com.neurotutor.auth.service.DiagnosticService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DiagnosticService diagnosticService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole() != null ? request.getRole() : User.UserRole.STUDENT)
                .createdAt(LocalDateTime.now())
                .enabled(true)
                .diagnosticCompleted(false) // ✅ par défaut
                .build();

        var savedUser = userRepository.save(user);

        var jwtToken = jwtService.generateToken(savedUser);
        var refreshToken = jwtService.generateRefreshToken(savedUser);

        var response = AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .role(savedUser.getRole())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // ✅ IMPORTANT : Ne déclencher le diagnostic QUE si étudiant et diagnostic pas encore fait
        if (user.getRole() == User.UserRole.STUDENT && !user.isDiagnosticCompleted()) {
            try {
                diagnosticService.triggerDiagnostic(user.getId().toString());
            } catch (Exception e) {
                // Ne pas échouer la connexion en cas d'échec du diagnostic
                System.err.println("Erreur diagnostic: " + e.getMessage());
            }
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        var response = AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token invalide");
        }

        String refreshToken = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(refreshToken);

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Token expiré");
        }

        var newJwtToken = jwtService.generateToken(user);

        var response = AuthResponse.builder()
                .token(newJwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(response);
    }

    // ✅ NOUVEAU : /me pour que le frontend sache rôle + diagnosticCompleted + level
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("email", user.getEmail());
        data.put("firstName", user.getFirstName());
        data.put("lastName", user.getLastName());
        data.put("role", user.getRole());
        data.put("diagnosticCompleted", user.isDiagnosticCompleted());
        data.put("diagnosticScore", user.getDiagnosticScore());
        data.put("level", user.getLevel());

        return ResponseEntity.ok(data);
    }

    // ✅ NOUVEAU : marquer diagnostic terminé (à appeler à la fin du test)
    @PostMapping("/diagnostic/complete")
    public ResponseEntity<?> completeDiagnostic(Authentication authentication,
                                                @Valid @RequestBody DiagnosticCompleteRequest req) {
        if (authentication == null) return ResponseEntity.status(401).build();

        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setDiagnosticCompleted(true);
        user.setDiagnosticScore(req.getScore());
        user.setLevel(req.getLevel());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Diagnostic enregistré",
                "diagnosticCompleted", true
        ));
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auth service fonctionne !");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
