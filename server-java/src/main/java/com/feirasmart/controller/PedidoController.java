package com.feirasmart.controller;

import com.feirasmart.config.JwtUserExtractor;
import com.feirasmart.model.Pedido;
import com.feirasmart.model.PedidoStatus;
import com.feirasmart.model.User;
import com.feirasmart.service.PedidoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {
    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private JwtUserExtractor jwtUserExtractor;

    @GetMapping
    public ResponseEntity<List<Pedido>> getAll(HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            System.out.println("Buscando pedidos para usuário: " + user.getId() + " tipo: " + user.getTipo());
            
            List<Pedido> pedidos;
            if (user.getTipo().name().equals("CLIENTE")) {
                pedidos = pedidoService.findByClienteId(user.getId());
            } else {
                pedidos = pedidoService.findByFeiranteUserId(user.getId());
            }
            
            System.out.println("Encontrados " + pedidos.size() + " pedidos");
            return ResponseEntity.ok(pedidos);
        } catch (RuntimeException e) {
            // Token não fornecido ou inválido
            if (e.getMessage() != null && e.getMessage().contains("Token não fornecido")) {
                System.err.println("Token não fornecido na requisição");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            System.err.println("Erro ao buscar pedidos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar pedidos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(pedidoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(
            HttpServletRequest request,
            @RequestBody CreatePedidoRequest createRequest) {
        try {
            System.out.println("📦 Recebendo requisição de criação de pedido:");
            System.out.println("  - Feirante ID: " + createRequest.getFeiranteId());
            System.out.println("  - Feira ID: " + createRequest.getFeiraId());
            System.out.println("  - Itens: " + (createRequest.getItens() != null ? createRequest.getItens().size() : 0));
            
            User user = jwtUserExtractor.extractUser(request);
            if (!user.getTipo().name().equals("CLIENTE")) {
                System.err.println("❌ Usuário não é cliente: " + user.getTipo());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<PedidoService.PedidoItemDTO> itensDTO = createRequest.getItens().stream()
                    .map(item -> {
                        PedidoService.PedidoItemDTO dto = new PedidoService.PedidoItemDTO();
                        dto.setProdutoId(item.getProdutoId());
                        dto.setNomeProduto(item.getNomeProduto());
                        dto.setQuantidade(item.getQuantidade());
                        dto.setPreco(item.getPreco());
                        return dto;
                    })
                    .toList();

            Pedido pedido = pedidoService.create(
                    user.getId(),
                    createRequest.getFeiranteId(),
                    createRequest.getFeiraId(),
                    itensDTO,
                    createRequest.getObservacoes()
            );

            System.out.println("✅ Pedido criado com sucesso: " + pedido.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
        } catch (RuntimeException e) {
            System.err.println("❌ Erro ao criar pedido: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Erro inesperado ao criar pedido: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro interno ao processar pedido: " + e.getMessage()));
        }
    }
    
    private static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Pedido> updateStatus(
            @PathVariable UUID id,
            HttpServletRequest request,
            @RequestBody UpdateStatusRequest updateRequest) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            if (!user.getTipo().name().equals("FEIRANTE")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            PedidoStatus status = PedidoStatus.valueOf(updateRequest.getStatus().toUpperCase());
            return ResponseEntity.ok(pedidoService.updateStatus(id, user.getId(), status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private static class CreatePedidoRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("feirante_id")
        private UUID feiranteId;
        
        @com.fasterxml.jackson.annotation.JsonProperty("feira_id")
        private UUID feiraId;
        
        private List<PedidoItemRequest> itens;
        private String observacoes;

        @com.fasterxml.jackson.annotation.JsonProperty("feirante_id")
        public UUID getFeiranteId() {
            return feiranteId;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("feirante_id")
        public void setFeiranteId(UUID feiranteId) {
            this.feiranteId = feiranteId;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("feira_id")
        public UUID getFeiraId() {
            return feiraId;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("feira_id")
        public void setFeiraId(UUID feiraId) {
            this.feiraId = feiraId;
        }

        public List<PedidoItemRequest> getItens() {
            return itens;
        }

        public void setItens(List<PedidoItemRequest> itens) {
            this.itens = itens;
        }

        public String getObservacoes() {
            return observacoes;
        }

        public void setObservacoes(String observacoes) {
            this.observacoes = observacoes;
        }
    }

    private static class PedidoItemRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("produto_id")
        private UUID produtoId;
        
        @com.fasterxml.jackson.annotation.JsonProperty("nome_produto")
        private String nomeProduto;
        
        private Integer quantidade;
        private java.math.BigDecimal preco;

        @com.fasterxml.jackson.annotation.JsonProperty("produto_id")
        public UUID getProdutoId() {
            return produtoId;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("produto_id")
        public void setProdutoId(UUID produtoId) {
            this.produtoId = produtoId;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("nome_produto")
        public String getNomeProduto() {
            return nomeProduto;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("nome_produto")
        public void setNomeProduto(String nomeProduto) {
            this.nomeProduto = nomeProduto;
        }

        public Integer getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(Integer quantidade) {
            this.quantidade = quantidade;
        }

        public java.math.BigDecimal getPreco() {
            return preco;
        }

        public void setPreco(java.math.BigDecimal preco) {
            this.preco = preco;
        }
    }

    private static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}



