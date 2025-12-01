package com.feirasmart.controller;

import com.feirasmart.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Value("${server.port:3001}")
    private String serverPort;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Nenhum arquivo foi enviado");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Salvar arquivo
            String filePath = fileStorageService.saveImage(file);

            // Construir URL completa
            String fileUrl = "http://localhost:" + serverPort + filePath;

            Map<String, String> response = new HashMap<>();
            response.put("message", "Imagem enviada com sucesso");
            response.put("filePath", filePath);
            response.put("fileUrl", fileUrl);

            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao fazer upload da imagem: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/image")
    public ResponseEntity<?> deleteImage(@RequestParam("filePath") String filePath) {
        try {
            fileStorageService.deleteImage(filePath);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Imagem excluída com sucesso");

            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao excluir imagem: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}


