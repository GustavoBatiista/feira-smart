package com.feirasmart.service;

import com.feirasmart.model.Feirante;
import com.feirasmart.model.Feira;
import com.feirasmart.model.User;
import com.feirasmart.repository.FeiranteRepository;
import com.feirasmart.repository.FeiraRepository;
import com.feirasmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FeiranteService {
    @Autowired
    private FeiranteRepository feiranteRepository;

    @Autowired
    private FeiraRepository feiraRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Feirante> findAll(UUID feiraId, UUID userId) {
        if (feiraId != null) {
            return feiranteRepository.findByFeiraId(feiraId);
        }
        if (userId != null) {
            return feiranteRepository.findByUserId(userId);
        }
        return feiranteRepository.findAll();
    }

    public Feirante findById(UUID id) {
        return feiranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feirante não encontrado"));
    }

    @Transactional
    public Feirante create(UUID userId, UUID feiraId, String nomeEstande, String descricao, String categoria, String avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Feira feira = feiraRepository.findById(feiraId)
                .orElseThrow(() -> new RuntimeException("Feira não encontrada"));

        if (feiranteRepository.findByUserIdAndFeiraId(userId, feiraId).isPresent()) {
            throw new RuntimeException("Você já está cadastrado nesta feira");
        }

        Feirante feirante = new Feirante();
        feirante.setUser(user);
        feirante.setFeira(feira);
        feirante.setNomeEstande(nomeEstande);
        feirante.setDescricao(descricao);
        feirante.setCategoria(categoria);
        feirante.setAvatar(avatar);

        return feiranteRepository.save(feirante);
    }

    @Transactional
    public Feirante update(UUID id, UUID userId, String nomeEstande, String descricao, String categoria, String avatar) {
        Feirante feirante = findById(id);
        
        if (!feirante.getUser().getId().equals(userId)) {
            throw new RuntimeException("Feirante não encontrado ou não pertence ao usuário");
        }

        if (nomeEstande != null) feirante.setNomeEstande(nomeEstande);
        if (descricao != null) feirante.setDescricao(descricao);
        if (categoria != null) feirante.setCategoria(categoria);
        if (avatar != null) feirante.setAvatar(avatar);

        return feiranteRepository.save(feirante);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Feirante feirante = findById(id);
        
        if (!feirante.getUser().getId().equals(userId)) {
            throw new RuntimeException("Feirante não encontrado ou não pertence ao usuário");
        }

        feiranteRepository.delete(feirante);
    }
}













