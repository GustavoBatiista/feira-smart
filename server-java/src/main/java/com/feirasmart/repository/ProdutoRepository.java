package com.feirasmart.repository;

import com.feirasmart.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    List<Produto> findByFeiranteId(UUID feiranteId);
    
    @Query("SELECT p FROM Produto p WHERE p.feirante.id = :feiranteId AND (:disponivel IS NULL OR p.disponivel = :disponivel)")
    List<Produto> findByFeiranteIdAndDisponivel(@Param("feiranteId") UUID feiranteId, @Param("disponivel") Boolean disponivel);
    
    @Query("SELECT p FROM Produto p WHERE p.user.id = :userId AND (:disponivel IS NULL OR p.disponivel = :disponivel)")
    List<Produto> findByUserIdAndDisponivel(@Param("userId") UUID userId, @Param("disponivel") Boolean disponivel);
    
    @Query("SELECT COUNT(p) FROM Produto p WHERE p.user.id = :userId AND p.disponivel = true")
    Long countProdutosAtivosByUserId(@Param("userId") UUID userId);
}



