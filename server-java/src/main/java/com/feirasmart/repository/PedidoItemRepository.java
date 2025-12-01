package com.feirasmart.repository;

import com.feirasmart.model.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, UUID> {
    List<PedidoItem> findByPedidoId(UUID pedidoId);
}









