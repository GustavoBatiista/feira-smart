package com.feirasmart.repository;

import com.feirasmart.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.feirante.user.id = :userId AND p.createdAt >= :inicio AND p.createdAt < :fim")
    Long countPedidosHojeByUserId(
        @Param("userId") UUID userId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
    
    @Query("SELECT COALESCE(SUM(p.total), 0.0) FROM Pedido p WHERE p.feirante.user.id = :userId AND p.createdAt >= :inicio AND p.createdAt < :fim")
    Double sumFaturamentoHojeByUserId(
        @Param("userId") UUID userId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
    
    @Query("SELECT COALESCE(SUM(p.total), 0.0) FROM Pedido p WHERE p.feirante.user.id = :userId AND p.createdAt >= :inicio AND p.createdAt <= :fim")
    Double sumFaturamentoPeriodo(
        @Param("userId") UUID userId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
    
    List<Pedido> findByFeiranteId(UUID feiranteId);
    
    @Query("SELECT p FROM Pedido p WHERE p.cliente.id = :clienteId")
    List<Pedido> findByClienteId(@Param("clienteId") UUID clienteId);
    
    @Query("SELECT p FROM Pedido p WHERE p.feirante.user.id = :userId")
    List<Pedido> findByFeiranteUserId(@Param("userId") UUID userId);
}
