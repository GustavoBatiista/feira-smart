package com.feirasmart.service;

import com.feirasmart.model.User;
import com.feirasmart.model.UserType;
import com.feirasmart.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getTipo().name())
                .build();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Transactional
    public User createUser(String email, String password, String nome, UserType tipo, String telefone) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado");
        }

        // Usar query nativa com cast explícito para o enum do PostgreSQL
        UUID userId = UUID.randomUUID();
        String tipoStr = tipo.name().toLowerCase(); // Converter para minúsculas para corresponder ao enum
        String passwordHash = passwordEncoder.encode(password);
        LocalDateTime now = LocalDateTime.now();

        // Query nativa com cast explícito para o enum do PostgreSQL
        entityManager.createNativeQuery(
            "INSERT INTO profiles (id, email, nome, tipo, telefone, password_hash, created_at, updated_at) " +
            "VALUES (:id, :email, :nome, CAST(:tipo AS user_type), :telefone, :passwordHash, :createdAt, :updatedAt)"
        )
        .setParameter("id", userId)
        .setParameter("email", email)
        .setParameter("nome", nome)
        .setParameter("tipo", tipoStr)
        .setParameter("telefone", telefone)
        .setParameter("passwordHash", passwordHash)
        .setParameter("createdAt", now)
        .setParameter("updatedAt", now)
        .executeUpdate();

        // Buscar o usuário criado
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Erro ao criar usuário"));
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}








