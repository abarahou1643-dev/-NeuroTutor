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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DiagnosticService diagnosticService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email déjà utilisé"));
        }

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole() != null ? request.getRole() : User.UserRole.STUDENT)
                .createdAt(LocalDateTime.now())
                .enabled(true)
                .diagnosticCompleted(false)
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
    public ResponseEntity<?> authenticate(@Valid @RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email ou mot de passe incorrect"));
        } catch (Exception e) {
            // si un autre problème arrive (DB, provider, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur serveur durant l'authentification"));
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Utilisateur non trouvé"));
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Déclencher diagnostic si étudiant et pas encore fait
        if (user.getRole() == User.UserRole.STUDENT && !user.isDiagnosticCompleted()) {
            try {
                diagnosticService.triggerDiagnostic(user.getId().toString());
            } catch (Exception e) {
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
    public ResponseEntity<?> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token invalide"));
        }

        String refreshToken = authHeader.substring(7);
        String userEmail;

        try {
            userEmail = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Refresh token invalide"));
        }

        var user = userRepository.findByEmail(userEmail)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Utilisateur non trouvé"));
        }

        if (!jwtService.isTokenValid(refreshToken, user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token expiré"));
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

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) return ResponseEntity.status(404).body(Map.of("message", "Utilisateur non trouvé"));

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
