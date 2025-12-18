package com.feirasmart.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.feirasmart.config.JwtUserExtractor;
import com.feirasmart.model.Pedido;
import com.feirasmart.model.PedidoStatus;
import com.feirasmart.model.User;
import com.feirasmart.repository.PedidoRepository;
import com.feirasmart.service.PedidoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<?> create(
            HttpServletRequest request,
            @RequestBody CreatePedidoRequest createRequest) {
        try {
            System.out.println("📥 Recebendo requisição para criar pedido");
            System.out.println("   feirante_id=" + createRequest.getFeiranteId());
            System.out.println("   feira_id=" + createRequest.getFeiraId());
            System.out.println("   itens=" + (createRequest.getItens() != null ? createRequest.getItens().size() : 0));
            
            // Extrair usuário do token (cliente)
            User user = jwtUserExtractor.extractUser(request);
            System.out.println("✅ Usuário extraído: " + user.getId() + " tipo: " + user.getTipo());
            
            // Verificar se é cliente
            if (!user.getTipo().name().equals("CLIENTE")) {
                System.err.println("❌ Usuário não é cliente: " + user.getTipo());
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Apenas clientes podem criar pedidos");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // Validar campos obrigatórios
            if (createRequest.getFeiranteId() == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "feirante_id é obrigatório");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            if (createRequest.getFeiraId() == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "feira_id é obrigatório");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            if (createRequest.getItens() == null || createRequest.getItens().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Pedido deve ter pelo menos um item");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Converter itens para DTO do serviço
            List<PedidoService.ItemPedidoDTO> itensDTO = createRequest.getItens().stream()
                    .map(item -> {
                        PedidoService.ItemPedidoDTO dto = new PedidoService.ItemPedidoDTO();
                        dto.setProdutoId(UUID.fromString(item.getProdutoId()));
                        dto.setNomeProduto(item.getNomeProduto());
                        dto.setQuantidade(item.getQuantidade());
                        dto.setPreco(item.getPreco());
                        return dto;
                    })
                    .toList();

            System.out.println("📦 Criando pedido...");
            Pedido pedidoCriado = pedidoService.create(
                    user.getId(),
                    UUID.fromString(createRequest.getFeiranteId()),
                    UUID.fromString(createRequest.getFeiraId()),
                    itensDTO,
                    createRequest.getObservacoes()
            );
            
            System.out.println("✅ Pedido criado com sucesso: " + pedidoCriado.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCriado);
        } catch (RuntimeException e) {
            System.err.println("❌ Erro ao criar pedido (RuntimeException): " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage() != null ? e.getMessage() : "Erro ao criar pedido");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Erro ao criar pedido (Exception): " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao criar pedido: " + (e.getMessage() != null ? e.getMessage() : "Erro desconhecido"));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> getAll(HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            System.out.println("📋 Buscando pedidos para usuário: " + user.getId() + " tipo: " + user.getTipo());
            
            List<Pedido> pedidos;
            if (user.getTipo().name().equals("FEIRANTE")) {
                // Buscar pedidos do feirante
                pedidos = pedidoRepository.findByFeiranteUserId(user.getId());
                System.out.println("   Buscando pedidos do feirante. Encontrados: " + pedidos.size());
            } else {
                // Buscar pedidos do cliente
                pedidos = pedidoRepository.findByClienteId(user.getId());
                System.out.println("   Buscando pedidos do cliente. Encontrados: " + pedidos.size());
            }
            
            // Log dos pedidos encontrados
            for (Pedido p : pedidos) {
                System.out.println("   Pedido ID: " + p.getId() + 
                                  ", Cliente ID: " + p.getCliente().getId() + 
                                  ", Total: " + p.getTotal() + 
                                  ", Itens: " + (p.getItens() != null ? p.getItens().size() : 0));
            }
            
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar pedidos: " + e.getMessage());
            e.printStackTrace();
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

    // DTO para receber requisição de criação de pedido
    private static class CreatePedidoRequest {
        @JsonProperty("feirante_id")
        private String feiranteId;

        @JsonProperty("feira_id")
        private String feiraId;
        
        private List<ItemRequest> itens;
        private String observacoes;

        public String getFeiranteId() {
            return feiranteId;
        }

        public void setFeiranteId(String feiranteId) {
            this.feiranteId = feiranteId;
        }

        public String getFeiraId() {
            return feiraId;
        }

        public void setFeiraId(String feiraId) {
            this.feiraId = feiraId;
        }

        public List<ItemRequest> getItens() {
            return itens;
        }

        public void setItens(List<ItemRequest> itens) {
            this.itens = itens;
        }

        public String getObservacoes() {
            return observacoes;
        }

        public void setObservacoes(String observacoes) {
            this.observacoes = observacoes;
        }
    }

    private static class ItemRequest {
        @JsonProperty("produto_id")
        private String produtoId;

        @JsonProperty("nome_produto")
        private String nomeProduto;
        
        private Integer quantidade;
        private BigDecimal preco;

        public String getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(String produtoId) {
            this.produtoId = produtoId;
        }

        public String getNomeProduto() {
            return nomeProduto;
        }

        public void setNomeProduto(String nomeProduto) {
            this.nomeProduto = nomeProduto;
        }

        public Integer getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(Integer quantidade) {
            this.quantidade = quantidade;
        }

        public BigDecimal getPreco() {
            return preco;
        }

        public void setPreco(BigDecimal preco) {
            this.preco = preco;
        }
    }
}
