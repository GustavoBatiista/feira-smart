package com.feirasmart.controller;

import com.feirasmart.config.JwtUtil;
import com.feirasmart.dto.AuthResponse;
import com.feirasmart.dto.LoginRequest;
import com.feirasmart.dto.RegisterRequest;
import com.feirasmart.model.User;
import com.feirasmart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getNome(),
                    request.getTipo(),
                    request.getTelefone()
            );

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getTipo().name());

            AuthResponse.UserResponse userResponse = new AuthResponse.UserResponse();
            userResponse.setId(user.getId());
            userResponse.setEmail(user.getEmail());
            userResponse.setNome(user.getNome());
            userResponse.setTipo(user.getTipo().name().toLowerCase());
            userResponse.setTelefone(user.getTelefone());
            userResponse.setAvatar(user.getAvatar());
            userResponse.setCreatedAt(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse("Usuário criado com sucesso", userResponse, token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao criar usuário"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Email é obrigatório"));
            }
            
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Senha é obrigatória"));
            }

            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Email ou senha incorretos"));

            if (!userService.validatePassword(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Email ou senha incorretos"));
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getTipo().name());

            AuthResponse.UserResponse userResponse = new AuthResponse.UserResponse();
            userResponse.setId(user.getId());
            userResponse.setEmail(user.getEmail());
            userResponse.setNome(user.getNome());
            userResponse.setTipo(user.getTipo().name().toLowerCase());
            userResponse.setTelefone(user.getTelefone());
            userResponse.setAvatar(user.getAvatar());
            userResponse.setCreatedAt(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));

            return ResponseEntity.ok(new AuthResponse("Login realizado com sucesso", userResponse, token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao fazer login"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            UUID userId = jwtUtil.getUserIdFromToken(token);
            User user = userService.findById(userId);

            AuthResponse.UserResponse userResponse = new AuthResponse.UserResponse();
            userResponse.setId(user.getId());
            userResponse.setEmail(user.getEmail());
            userResponse.setNome(user.getNome());
            userResponse.setTipo(user.getTipo().name().toLowerCase());
            userResponse.setTelefone(user.getTelefone());
            userResponse.setAvatar(user.getAvatar());
            userResponse.setCreatedAt(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));

            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token inválido"));
        }
    }

    private static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}

