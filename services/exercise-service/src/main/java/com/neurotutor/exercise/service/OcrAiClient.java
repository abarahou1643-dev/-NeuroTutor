package com.neurotutor.exercise.service;

import com.neurotutor.exercise.dto.ia.AiStepEvalRequest;
import com.neurotutor.exercise.dto.ia.AiStepEvalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class OcrAiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    // ✅ mets ça dans application.properties plus tard
    private final String AI_BASE_URL = "http://127.0.0.1:8082";

    public String extractTextFromImage(MultipartFile image) {
        try {
            String url = AI_BASE_URL + "/ocr/process";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("text", "");

            ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename() == null ? "image.png" : image.getOriginalFilename();
                }
            };

            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            return "";
        } catch (Exception e) {
            System.out.println("[OCR] Error: " + e.getMessage());
            return "";
        }
    }

    public AiStepEvalResponse evaluateSteps(AiStepEvalRequest req) {
        try {
            String url = AI_BASE_URL + "/evaluation/evaluate-steps";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<AiStepEvalRequest> entity = new HttpEntity<>(req, headers);

            ResponseEntity<AiStepEvalResponse> resp =
                    restTemplate.exchange(url, HttpMethod.POST, entity, AiStepEvalResponse.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                System.out.println("[AI] evaluateSteps non-2xx: " + resp.getStatusCode());
                return null;
            }

            return resp.getBody();
        } catch (Exception e) {
            System.out.println("[AI] Error calling evaluateSteps: " + e.getMessage());
            return null;
        }
    }
}
