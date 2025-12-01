package com.feirasmart.repository;

import com.feirasmart.model.Pedido;
import com.feirasmart.model.PedidoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.cliente " +
           "JOIN FETCH p.feirante f " +
           "JOIN FETCH f.user " +
           "JOIN FETCH p.feira " +
           "WHERE p.cliente.id = :clienteId " +
           "ORDER BY p.createdAt DESC")
    List<Pedido> findByClienteIdOrderByCreatedAtDesc(@Param("clienteId") UUID clienteId);
    
    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.cliente " +
           "JOIN FETCH p.feirante f " +
           "JOIN FETCH f.user " +
           "JOIN FETCH p.feira " +
           "WHERE f.user.id = :userId " +
           "ORDER BY p.createdAt DESC")
    List<Pedido> findByFeiranteUserId(@Param("userId") UUID userId);
    
    @Query("SELECT COUNT(p) FROM Pedido p JOIN p.feirante f WHERE f.user.id = :userId AND p.createdAt >= :inicioHoje AND p.createdAt < :fimHoje")
    Long countPedidosHojeByUserId(@Param("userId") UUID userId, @Param("inicioHoje") LocalDateTime inicioHoje, @Param("fimHoje") LocalDateTime fimHoje);
    
    @Query("SELECT COALESCE(SUM(p.total), 0.0) FROM Pedido p JOIN p.feirante f WHERE f.user.id = :userId AND p.createdAt >= :inicioHoje AND p.createdAt < :fimHoje")
    Double sumFaturamentoHojeByUserId(@Param("userId") UUID userId, @Param("inicioHoje") LocalDateTime inicioHoje, @Param("fimHoje") LocalDateTime fimHoje);
    
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p JOIN p.feirante f WHERE f.user.id = :userId AND p.createdAt >= :inicio AND p.createdAt <= :fim")
    Double sumFaturamentoPeriodo(@Param("userId") UUID userId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}

