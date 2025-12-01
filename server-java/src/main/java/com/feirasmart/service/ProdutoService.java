package com.feirasmart.service;

import com.feirasmart.model.Produto;
import com.feirasmart.model.Feirante;
import com.feirasmart.model.User;
import com.feirasmart.repository.ProdutoRepository;
import com.feirasmart.repository.FeiranteRepository;
import com.feirasmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProdutoService {
    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private FeiranteRepository feiranteRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Produto> findAll(UUID feiranteId, UUID userId, Boolean disponivel) {
        if (userId != null) {
            return produtoRepository.findByUserIdAndDisponivel(userId, disponivel);
        } else if (feiranteId != null) {
            // Buscar user_id do feirante para compatibilidade
            Feirante feirante = feiranteRepository.findById(feiranteId)
                    .orElse(null);
            if (feirante != null) {
                return produtoRepository.findByUserIdAndDisponivel(feirante.getUser().getId(), disponivel);
            }
            return produtoRepository.findByFeiranteIdAndDisponivel(feiranteId, disponivel);
        }
        return produtoRepository.findAll();
    }

    public Produto findById(UUID id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    @Transactional
    public Produto create(UUID userId, Produto produto) {
        // Buscar o usuário
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Vincular produto ao usuário (feirante)
        produto.setUser(user);
        
        // Tentar buscar um feirante existente para compatibilidade, mas não é obrigatório
        List<Feirante> feirantes = feiranteRepository.findByUserId(userId);
        if (!feirantes.isEmpty()) {
            // Usar o primeiro feirante encontrado para manter compatibilidade
            Feirante feirante = feirantes.get(0);
            produto.setFeirante(feirante);
        }
        // Se não houver feirante cadastrado, produto ainda pode ser criado vinculado apenas ao user_id
        
        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto update(UUID id, UUID userId, Produto produtoData) {
        Produto produto = findById(id);
        
        // Verificar se o produto pertence ao usuário (usando user_id)
        if (produto.getUser() == null || !produto.getUser().getId().equals(userId)) {
            throw new RuntimeException("Produto não encontrado ou não pertence ao usuário");
        }

        if (produtoData.getNome() != null) produto.setNome(produtoData.getNome());
        if (produtoData.getDescricao() != null) produto.setDescricao(produtoData.getDescricao());
        if (produtoData.getPreco() != null) produto.setPreco(produtoData.getPreco());
        if (produtoData.getUnidade() != null) produto.setUnidade(produtoData.getUnidade());
        if (produtoData.getCategoria() != null) produto.setCategoria(produtoData.getCategoria());
        if (produtoData.getImagem() != null) produto.setImagem(produtoData.getImagem());
        if (produtoData.getEstoque() != null) produto.setEstoque(produtoData.getEstoque());
        if (produtoData.getDisponivel() != null) produto.setDisponivel(produtoData.getDisponivel());

        return produtoRepository.save(produto);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Produto produto = findById(id);
        
        // Verificar se o produto pertence ao usuário (usando user_id)
        if (produto.getUser() == null || !produto.getUser().getId().equals(userId)) {
            throw new RuntimeException("Produto não encontrado ou não pertence ao usuário");
        }

        produtoRepository.deleteById(id);
    }
}



