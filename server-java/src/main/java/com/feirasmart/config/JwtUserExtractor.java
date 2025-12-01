package com.feirasmart.config;

import com.feirasmart.model.User;
import com.feirasmart.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class JwtUserExtractor {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    public User extractUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token não fornecido");
        }

        String token = authHeader.substring(7);
        UUID userId = jwtUtil.getUserIdFromToken(token);
        return userService.findById(userId);
    }
}








