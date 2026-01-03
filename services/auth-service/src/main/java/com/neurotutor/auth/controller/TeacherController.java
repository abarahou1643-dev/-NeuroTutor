package com.neurotutor.auth.controller;

import com.neurotutor.auth.dto.StudentSummaryDto;
import com.neurotutor.auth.model.User;
import com.neurotutor.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final UserRepository userRepository;

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/students")
    public ResponseEntity<List<StudentSummaryDto>> getStudents() {
        List<User> students = userRepository.findByRole(User.UserRole.STUDENT);

        List<StudentSummaryDto> dto = students.stream()
                .map(u -> StudentSummaryDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .build())
                .toList();

        return ResponseEntity.ok(dto);
    }
}
