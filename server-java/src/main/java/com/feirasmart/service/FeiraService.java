package com.feirasmart.service;

import com.feirasmart.model.Feira;
import com.feirasmart.repository.FeiraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FeiraService {
    @Autowired
    private FeiraRepository feiraRepository;

    public List<Feira> findAll() {
        return feiraRepository.findAll();
    }

    public Feira findById(UUID id) {
        return feiraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feira não encontrada"));
    }

    @Transactional
    public Feira create(Feira feira) {
        return feiraRepository.save(feira);
    }

    @Transactional
    public Feira update(UUID id, Feira feiraData) {
        Feira feira = findById(id);
        if (feiraData.getNome() != null) feira.setNome(feiraData.getNome());
        if (feiraData.getLocalizacao() != null) feira.setLocalizacao(feiraData.getLocalizacao());
        if (feiraData.getDescricao() != null) feira.setDescricao(feiraData.getDescricao());
        if (feiraData.getDiaDaSemana() != null) feira.setDiaDaSemana(feiraData.getDiaDaSemana());
        if (feiraData.getHoraInicio() != null) feira.setHoraInicio(feiraData.getHoraInicio());
        if (feiraData.getHoraFim() != null) feira.setHoraFim(feiraData.getHoraFim());
        if (feiraData.getImagem() != null) feira.setImagem(feiraData.getImagem());
        return feiraRepository.save(feira);
    }

    @Transactional
    public void delete(UUID id) {
        if (!feiraRepository.existsById(id)) {
            throw new RuntimeException("Feira não encontrada");
        }
        feiraRepository.deleteById(id);
    }
}

