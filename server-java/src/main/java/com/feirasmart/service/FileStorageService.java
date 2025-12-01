package com.feirasmart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.upload-max-size:5242880}")
    private long maxFileSize; // 5MB default

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");

    /**
     * Resolve o caminho absoluto do diretório de uploads
     */
    private Path resolveUploadPath() {
        Path uploadPath;
        if (Paths.get(uploadDir).isAbsolute()) {
            uploadPath = Paths.get(uploadDir);
        } else {
            // Caminho relativo: usar o diretório raiz do projeto
            String userDir = System.getProperty("user.dir");
            uploadPath = Paths.get(userDir, uploadDir);
        }
        return uploadPath.toAbsolutePath();
    }

    /**
     * Salva um arquivo de imagem e retorna o caminho relativo
     */
    public String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode ser vazio");
        }

        // Validar tamanho do arquivo
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("Arquivo muito grande. Tamanho máximo: " + (maxFileSize / 1024 / 1024) + "MB");
        }

        // Validar extensão
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Nome do arquivo inválido");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Extensões permitidas: " + ALLOWED_EXTENSIONS);
        }

        // Resolver o caminho do diretório de uploads
        Path uploadPath = resolveUploadPath();
        
        // Criar diretório se não existir
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("📁 Diretório de upload criado: " + uploadPath);
        }

        // Criar diretório para imagens de feiras
        Path feiraImagesPath = uploadPath.resolve("feiras");
        if (!Files.exists(feiraImagesPath)) {
            Files.createDirectories(feiraImagesPath);
            System.out.println("📁 Diretório de feiras criado: " + feiraImagesPath);
        }

        // Gerar nome único para o arquivo
        String fileName = UUID.randomUUID().toString() + "." + extension;
        Path filePath = feiraImagesPath.resolve(fileName);

        // Salvar arquivo
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        System.out.println("✅ Arquivo salvo: " + filePath);
        System.out.println("   URL de acesso: /uploads/feiras/" + fileName);

        // Retornar caminho relativo para acesso via URL
        return "/uploads/feiras/" + fileName;
    }

    /**
     * Exclui um arquivo de imagem
     */
    public void deleteImage(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        // Resolver o caminho do diretório de uploads
        Path uploadPath = resolveUploadPath();
        
        // Remover barra inicial se existir
        String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
        Path path = uploadPath.resolve(cleanPath);

        if (Files.exists(path)) {
            Files.delete(path);
        }
    }

    /**
     * Obtém a extensão do arquivo
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            throw new IllegalArgumentException("Arquivo sem extensão");
        }
        return filename.substring(lastDotIndex + 1);
    }
}

