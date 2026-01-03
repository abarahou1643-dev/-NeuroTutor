package com.neurotutor.exercise.service;

import com.neurotutor.exercise.dto.StudentProgressDto;
import com.neurotutor.exercise.model.Submission;
import com.neurotutor.exercise.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherProgressService {

    private final SubmissionRepository submissionRepository;

    public StudentProgressDto getProgress(String userId) {
        List<Submission> subs = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);

        long total = subs.size();
        long correct = subs.stream().filter(Submission::isCorrect).count();

        // ✅ scoreEarned est souvent Integer (nullable) => pas d'int == null
        int totalScore = subs.stream()
                .mapToInt(s -> {
                    Integer sc = s.getScoreEarned();
                    return sc == null ? 0 : sc;
                })
                .sum();

        Submission last = subs.isEmpty() ? null : subs.get(0);

        return StudentProgressDto.builder()
                .userId(userId)
                .totalSubmissions(total)
                .correctSubmissions(correct)
                .totalScore(totalScore)
                .lastSubmissionAt(last != null ? last.getSubmittedAt() : null)
                .build();
    }
}
