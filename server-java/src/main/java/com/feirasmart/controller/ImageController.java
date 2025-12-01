package com.feirasmart.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*")
public class ImageController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/feiras/{filename:.+}")
    public ResponseEntity<Resource> getFeiraImage(@PathVariable String filename) {
        try {
            // Resolver caminho do arquivo
            Path uploadPath;
            if (Paths.get(uploadDir).isAbsolute()) {
                uploadPath = Paths.get(uploadDir);
            } else {
                String userDir = System.getProperty("user.dir");
                uploadPath = Paths.get(userDir, uploadDir);
            }
            uploadPath = uploadPath.toAbsolutePath();

            Path filePath = uploadPath.resolve("feiras").resolve(filename);

            File file = filePath.toFile();
            
            if (!file.exists() || !file.isFile()) {
                System.out.println("❌ Arquivo não encontrado: " + filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Resource resource = new FileSystemResource(file);

            // Determinar content type
            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (Exception e) {
                // Ignorar erro ao detectar content type
            }
            
            if (contentType == null) {
                contentType = "application/octet-stream";
                // Tentar determinar pelo nome do arquivo
                String lowerFilename = filename.toLowerCase();
                if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (lowerFilename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lowerFilename.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (lowerFilename.endsWith(".webp")) {
                    contentType = "image/webp";
                }
            }

            System.out.println("✅ Servindo arquivo: " + filePath);
            System.out.println("   Content-Type: " + contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("❌ Erro ao servir imagem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}


