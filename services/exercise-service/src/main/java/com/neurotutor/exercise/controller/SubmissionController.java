package com.neurotutor.exercise.controller;

import com.neurotutor.exercise.dto.SubmitExerciseRequest;
import com.neurotutor.exercise.dto.SubmitExerciseResponse;
import com.neurotutor.exercise.model.Submission;
import com.neurotutor.exercise.repository.SubmissionRepository;
import com.neurotutor.exercise.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ✅ pour éviter blocage CORS en dev
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionRepository submissionRepository;

    // ✅ POST /api/v1/submissions/{exerciseId}
    @PostMapping("/{exerciseId}")
    public SubmitExerciseResponse submit(
            @PathVariable String exerciseId,
            @RequestBody SubmitExerciseRequest req
    ) {
        return submissionService.submit(exerciseId, req);
    }

    // ✅ GET /api/v1/submissions/user/{userId}
    @GetMapping("/user/{userId}")
    public List<Submission> listByUser(@PathVariable String userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    // ✅ DEBUG: GET /api/v1/submissions
    @GetMapping
    public List<Submission> listAll() {
        return submissionRepository.findAll();
    }
}
