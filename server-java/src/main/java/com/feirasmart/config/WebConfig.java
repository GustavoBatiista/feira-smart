package com.feirasmart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Resolver o caminho do diretório de uploads usando a mesma lógica do FileStorageService
        Path uploadPath;
        if (Paths.get(uploadDir).isAbsolute()) {
            uploadPath = Paths.get(uploadDir);
        } else {
            // Caminho relativo: usar o diretório raiz do projeto
            String userDir = System.getProperty("user.dir");
            uploadPath = Paths.get(userDir, uploadDir);
        }
        
        uploadPath = uploadPath.toAbsolutePath();
        
        // Garantir que o caminho termine com barra
        String uploadPathString = uploadPath.toString().replace("\\", "/");
        if (!uploadPathString.endsWith("/")) {
            uploadPathString += "/";
        }
        
        System.out.println("📁 Configurando recursos estáticos:");
        System.out.println("   Handler: /uploads/**");
        System.out.println("   Location: file:" + uploadPathString);
        System.out.println("   Caminho absoluto: " + uploadPath);
        
        // Verificar se o diretório existe
        java.io.File uploadDirFile = uploadPath.toFile();
        if (uploadDirFile.exists()) {
            System.out.println("   ✅ Diretório de uploads existe");
            java.io.File feirasDir = new java.io.File(uploadDirFile, "feiras");
            if (feirasDir.exists()) {
                System.out.println("   ✅ Diretório feiras existe");
                java.io.File[] files = feirasDir.listFiles();
                if (files != null) {
                    System.out.println("   📁 Arquivos em feiras: " + files.length);
                    for (java.io.File file : files) {
                        System.out.println("      - " + file.getName());
                    }
                }
            } else {
                System.out.println("   ⚠️  Diretório feiras NÃO existe");
            }
        } else {
            System.out.println("   ⚠️  Diretório de uploads NÃO existe");
        }
        
        // Configurar acesso aos arquivos de upload
        // IMPORTANTE: O Spring remove o prefixo do handler, então /uploads/** mapeia diretamente
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPathString)
                .setCachePeriod(3600); // Cache por 1 hora
    }
}

