package com.feirasmart.controller;

import com.feirasmart.config.JwtUserExtractor;
import com.feirasmart.model.Pedido;
import com.feirasmart.model.PedidoStatus;
import com.feirasmart.model.User;
import com.feirasmart.repository.PedidoRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private JwtUserExtractor jwtUserExtractor;

    @GetMapping
    public ResponseEntity<List<Pedido>> getAll(HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            
            List<Pedido> pedidos;
            if (user.getTipo().name().equals("FEIRANTE")) {
                // Buscar pedidos do feirante
                pedidos = pedidoRepository.findByFeiranteUserId(user.getId());
            } else {
                // Buscar pedidos do cliente
                pedidos = pedidoRepository.findByClienteId(user.getId());
            }
            
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable UUID id, HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            Pedido pedido = pedidoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
            
            // Verificar se o pedido pertence ao usuário
            boolean isOwner = false;
            if (user.getTipo().name().equals("FEIRANTE")) {
                isOwner = pedido.getFeirante().getUser().getId().equals(user.getId());
            } else {
                isOwner = pedido.getCliente().getId().equals(user.getId());
            }
            
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID id,
            HttpServletRequest request,
            @RequestBody Map<String, String> requestBody) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            
            if (!user.getTipo().name().equals("FEIRANTE")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Apenas feirantes podem atualizar o status dos pedidos");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Pedido pedido = pedidoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
            
            // Verificar se o pedido pertence ao feirante
            if (!pedido.getFeirante().getUser().getId().equals(user.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Pedido não pertence ao feirante");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            String statusStr = requestBody.get("status");
            if (statusStr == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Status é obrigatório");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            try {
                PedidoStatus status = PedidoStatus.valueOf(statusStr.toUpperCase());
                pedido.setStatus(status);
                pedidoRepository.save(pedido);
                
                return ResponseEntity.ok(pedido);
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Status inválido");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Pedido não encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro de autenticação ou autorização");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
