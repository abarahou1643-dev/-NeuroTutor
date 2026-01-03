package com.neurotutor.exercise.service;

import com.neurotutor.exercise.dto.SubmitExerciseRequest;
import com.neurotutor.exercise.dto.SubmitExerciseResponse;
import com.neurotutor.exercise.dto.ia.AiStepEvalRequest;
import com.neurotutor.exercise.dto.ia.AiStepEvalResponse;
import com.neurotutor.exercise.model.Exercise;
import com.neurotutor.exercise.model.Submission;
import com.neurotutor.exercise.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ExerciseService exerciseService;
    private final OcrAiClient ocrAiClient;

    public SubmitExerciseResponse submit(String exerciseId, SubmitExerciseRequest req) {
        if (req == null) throw new IllegalArgumentException("Request body is required");
        if (req.getUserId() == null || req.getUserId().isBlank())
            throw new IllegalArgumentException("userId is required");

        // ✅ step-by-step
        if (req.getSteps() != null && !req.getSteps().isEmpty()) {
            String finalAns = (req.getFinalAnswer() != null && !req.getFinalAnswer().isBlank())
                    ? req.getFinalAnswer()
                    : req.getAnswer();

            if (finalAns == null || finalAns.isBlank()) {
                throw new IllegalArgumentException("finalAnswer (or answer) is required when steps are provided");
            }

            return submitWithSteps(exerciseId, req.getUserId(), req.getSteps(), finalAns);
        }

        // ✅ mode simple
        if (req.getAnswer() == null || req.getAnswer().isBlank()) {
            throw new IllegalArgumentException("answer is required");
        }

        return submitSimple(exerciseId, req.getUserId(), req.getAnswer());
    }

    public SubmitExerciseResponse submitMultipart(
            String exerciseId,
            String userId,
            String answer,
            MultipartFile image,
            MultipartFile audio
    ) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");

        // si answer vide et image existe -> OCR
        if ((answer == null || answer.isBlank()) && image != null && !image.isEmpty()) {
            answer = ocrAiClient.extractTextFromImage(image);
        }

        if (answer == null || answer.isBlank()) {
            throw new IllegalArgumentException("answer is required");
        }

        return submitSimple(exerciseId, userId, answer);
    }

    public List<Submission> listByUser(String userId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    public List<Submission> listByUserAndExercise(String userId, String exerciseId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");
        if (exerciseId == null || exerciseId.isBlank())
            throw new IllegalArgumentException("exerciseId is required");
        return submissionRepository.findByUserIdAndExerciseId(userId, exerciseId);
    }

    private SubmitExerciseResponse submitSimple(String exerciseId, String userId, String answer) {
        Exercise exercise = exerciseService.getExerciseByIdOrThrow(exerciseId);

        String expected = safe(exercise.getSolution());
        String given = safe(answer);

        boolean correct = normalize(given).equals(normalize(expected));
        int points = exercise.getPoints() != null ? exercise.getPoints() : 10;
        int earned = correct ? points : 0;

        Submission sub = Submission.builder()
                .userId(userId)
                .exerciseId(exerciseId)
                .answer(given)
                .finalAnswer(given)
                .steps(null)
                .correct(correct)
                .scoreEarned(earned)
                .submittedAt(LocalDateTime.now())
                .imageUrl(null)
                .audioUrl(null)
                .aiGlobalScore(null)
                .build();

        Submission saved = submissionRepository.save(sub);

        return SubmitExerciseResponse.builder()
                .submissionId(saved.getId())
                .userId(saved.getUserId())
                .exerciseId(saved.getExerciseId())
                .answer(saved.getAnswer())
                .correct(saved.isCorrect())
                .scoreEarned(saved.getScoreEarned())
                .submittedAt(saved.getSubmittedAt())
                .imageUrl(saved.getImageUrl())
                .audioUrl(saved.getAudioUrl())
                .stepsFeedback(null)
                .generatedSolutionSteps(null)
                .aiGlobalScore(null)
                .build();
    }

    public SubmitExerciseResponse submitWithSteps(
            String exerciseId,
            String userId,
            List<String> steps,
            String finalAnswer
    ) {
        Exercise exercise = exerciseService.getExerciseByIdOrThrow(exerciseId);

        String expected = safe(exercise.getSolution());
        String finalAns = safe(finalAnswer);

        // ✅ 1) Correct final = source of truth
        boolean finalCorrect = normalize(finalAns).equals(normalize(expected));

        int points = exercise.getPoints() != null ? exercise.getPoints() : 10;

        // ✅ 2) Feedback steps
        AiStepEvalResponse aiResp = null;
        List<SubmitExerciseResponse.StepFeedback> feedbacks;

        if (finalCorrect) {
            // ✅ IMPORTANT: si la réponse finale est correcte, on ne casse pas l'utilisateur
            // => on marque les étapes comme OK (ou tu peux mettre correct=null si tu veux "non évalué")
            feedbacks = buildAllOkFeedback(steps);

            // optionnel: appeler l'AI uniquement pour generatedSolutionSteps (conseils),
            // mais PAS pour marquer les steps faux.
            // aiResp = ocrAiClient.evaluateSteps(new AiStepEvalRequest(exerciseId, userId, expected, steps, finalAns));

        } else {
            // ✅ si final faux, on peut utiliser l'AI pour feedback
            aiResp = ocrAiClient.evaluateSteps(
                    new AiStepEvalRequest(exerciseId, userId, expected, steps, finalAns)
            );

            List<AiStepEvalResponse.StepFeedback> aiFeedback =
                    (aiResp != null && aiResp.getStepsFeedback() != null)
                            ? aiResp.getStepsFeedback()
                            : Collections.emptyList();

            feedbacks = aiFeedback.stream()
                    .map(sf -> new SubmitExerciseResponse.StepFeedback(
                            sf.getIndex(),
                            sf.getStep(),
                            sf.isCorrect(),
                            sf.getHint(),
                            sf.getCorrectedStep()
                    ))
                    .toList();
        }

        // ✅ 3) Score
        int earned;
        if (!finalCorrect) {
            earned = 0;
        } else {
            // bonus max 30% selon ratio steps correct
            int bonus = computeStepsBonus(points, feedbacks);
            int maxBonus = (int) Math.round(points * 0.3);
            earned = points + Math.min(bonus, maxBonus);
        }

        Submission sub = Submission.builder()
                .userId(userId)
                .exerciseId(exerciseId)
                .answer(finalAns)
                .finalAnswer(finalAns)
                .steps(steps)
                .correct(finalCorrect)
                .scoreEarned(earned)
                .submittedAt(LocalDateTime.now())
                .aiGlobalScore(aiResp != null ? aiResp.getGlobalScore() : null)
                .build();

        Submission saved = submissionRepository.save(sub);

        return SubmitExerciseResponse.builder()
                .submissionId(saved.getId())
                .userId(saved.getUserId())
                .exerciseId(saved.getExerciseId())
                .answer(saved.getAnswer())
                .correct(saved.isCorrect())
                .scoreEarned(saved.getScoreEarned())
                .submittedAt(saved.getSubmittedAt())
                .stepsFeedback(feedbacks)
                .generatedSolutionSteps(aiResp != null ? aiResp.getGeneratedSolutionSteps() : null)
                .aiGlobalScore(aiResp != null ? aiResp.getGlobalScore() : null)
                .build();
    }

    private List<SubmitExerciseResponse.StepFeedback> buildAllOkFeedback(List<String> steps) {
        if (steps == null) return Collections.emptyList();
        for (int i = 0; i < steps.size(); i++) {
            // nothing
        }
        return java.util.stream.IntStream.range(0, steps.size())
                .mapToObj(i -> new SubmitExerciseResponse.StepFeedback(
                        i,
                        steps.get(i),
                        true,
                        null,
                        null
                ))
                .toList();
    }

    private int computeStepsBonus(int points, List<SubmitExerciseResponse.StepFeedback> feedbacks) {
        if (feedbacks == null || feedbacks.isEmpty()) return 0;

        long correctCount = feedbacks.stream()
                .filter(SubmitExerciseResponse.StepFeedback::isCorrect)
                .count();

        double ratio = (double) correctCount / (double) feedbacks.size();
        return (int) Math.round(points * 0.3 * ratio);
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }

    private String normalize(String s) {
        return s == null ? "" : s.replace(" ", "").toLowerCase();
    }
}
