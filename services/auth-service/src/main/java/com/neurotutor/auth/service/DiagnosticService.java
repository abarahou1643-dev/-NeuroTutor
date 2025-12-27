package com.neurotutor.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@Service
public class DiagnosticService {

    @Value("${diagnostic.service.url:http://localhost:8083/api/v1/diagnostic}")
    private String diagnosticServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    public void triggerDiagnostic(String studentId) {
        try {
            // Vérifier d'abord si un diagnostic existe déjà pour cet étudiant
            String checkUrl = String.format("%s/result/%s", diagnosticServiceUrl, studentId);
            ResponseEntity<Map> response = restTemplate.getForEntity(checkUrl, Map.class);
            
            // Si aucun diagnostic n'existe ou si le diagnostic précédent est trop ancien, en démarrer un nouveau
            if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
                startNewDiagnostic(studentId);
            }
        } catch (Exception e) {
            // En cas d'erreur, on log l'erreur mais on ne bloque pas le flux de connexion
            System.err.println("Erreur lors de la vérification du diagnostic: " + e.getMessage());
        }
    }

    private void startNewDiagnostic(String studentId) {
        try {
            String startUrl = String.format("%s/start", diagnosticServiceUrl);
            Map<String, String> request = new HashMap<>();
            request.put("studentId", studentId);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                startUrl, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("Nouveau diagnostic démarré pour l'étudiant: " + studentId);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du démarrage d'un nouveau diagnostic: " + e.getMessage());
        }
    }
}
