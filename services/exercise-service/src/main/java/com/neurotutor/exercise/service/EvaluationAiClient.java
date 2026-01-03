package com.neurotutor.exercise.service;

import com.neurotutor.exercise.dto.ia.AiStepEvalRequest;
import com.neurotutor.exercise.dto.ia.AiStepEvalResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EvaluationAiClient {

    private final String AI_BASE_URL = "http://localhost:8082";
    private final RestTemplate restTemplate = new RestTemplate();

    public AiStepEvalResponse evaluateSteps(AiStepEvalRequest req) {
        String url = AI_BASE_URL + "/evaluation/evaluate-steps";
        return restTemplate.postForObject(url, req, AiStepEvalResponse.class);
    }
}
