package com.feirasmart.controller;

import com.feirasmart.config.JwtUserExtractor;
import com.feirasmart.model.Produto;
import com.feirasmart.model.User;
import com.feirasmart.service.ProdutoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {
    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private JwtUserExtractor jwtUserExtractor;

    @GetMapping
    public ResponseEntity<List<Produto>> getAll(
            @RequestParam(required = false) UUID feirante_id,
            @RequestParam(required = false) UUID user_id,
            @RequestParam(required = false) Boolean disponivel) {
        return ResponseEntity.ok(produtoService.findAll(feirante_id, user_id, disponivel));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(produtoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(
            HttpServletRequest request,
            @RequestBody CreateProdutoRequest createRequest) {
        try {
            System.out.println("📥 Recebendo requisição para criar produto");
            System.out.println("   Dados recebidos: nome=" + createRequest.getNome() + ", preco=" + createRequest.getPreco());
            
            User user = jwtUserExtractor.extractUser(request);
            System.out.println("✅ Usuário extraído: " + user.getId() + " tipo: " + user.getTipo());
            
            if (!user.getTipo().name().equals("FEIRANTE")) {
                System.err.println("❌ Usuário não é feirante: " + user.getTipo());
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Apenas feirantes podem criar produtos");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // Validar campos obrigatórios
            if (createRequest.getNome() == null || createRequest.getNome().trim().isEmpty()) {
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Nome do produto é obrigatório");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            if (createRequest.getPreco() == null || createRequest.getPreco().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Preço é obrigatório e deve ser maior que zero");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            if (createRequest.getUnidade() == null || createRequest.getUnidade().trim().isEmpty()) {
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Unidade é obrigatória");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            Produto produto = new Produto();
            produto.setNome(createRequest.getNome().trim());
            produto.setDescricao(createRequest.getDescricao() != null ? createRequest.getDescricao().trim() : null);
            produto.setPreco(createRequest.getPreco());
            produto.setUnidade(createRequest.getUnidade().trim());
            produto.setCategoria(createRequest.getCategoria() != null ? createRequest.getCategoria().trim() : null);
            produto.setImagem(createRequest.getImagem() != null ? createRequest.getImagem().trim() : null);
            produto.setEstoque(createRequest.getEstoque() != null ? createRequest.getEstoque() : 0);
            produto.setDisponivel(createRequest.getDisponivel() != null ? createRequest.getDisponivel() : true);

            System.out.println("📦 Dados do produto preparados: nome=" + produto.getNome() + ", preco=" + produto.getPreco() + ", unidade=" + produto.getUnidade());
            System.out.println("   user_id será: " + user.getId());
            
            Produto produtoCriado = produtoService.create(user.getId(), produto);
            System.out.println("✅ Produto criado com sucesso: " + produtoCriado.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(produtoCriado);
        } catch (RuntimeException e) {
            System.err.println("❌ Erro ao criar produto (RuntimeException): " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", e.getMessage() != null ? e.getMessage() : "Erro ao criar produto");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Erro ao criar produto (Exception): " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Erro ao criar produto: " + (e.getMessage() != null ? e.getMessage() : "Erro desconhecido"));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> update(
            @PathVariable UUID id,
            HttpServletRequest request,
            @RequestBody Produto produto) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            if (!user.getTipo().name().equals("FEIRANTE")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(produtoService.update(id, user.getId(), produto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            if (!user.getTipo().name().equals("FEIRANTE")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            produtoService.delete(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private static class CreateProdutoRequest {
        private String nome;
        private String descricao;
        private java.math.BigDecimal preco;
        private String unidade;
        private String categoria;
        private String imagem;
        private Integer estoque;
        private Boolean disponivel;

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getDescricao() {
            return descricao;
        }

        public void setDescricao(String descricao) {
            this.descricao = descricao;
        }

        public java.math.BigDecimal getPreco() {
            return preco;
        }

        public void setPreco(java.math.BigDecimal preco) {
            this.preco = preco;
        }

        public String getUnidade() {
            return unidade;
        }

        public void setUnidade(String unidade) {
            this.unidade = unidade;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public String getImagem() {
            return imagem;
        }

        public void setImagem(String imagem) {
            this.imagem = imagem;
        }

        public Integer getEstoque() {
            return estoque;
        }

        public void setEstoque(Integer estoque) {
            this.estoque = estoque;
        }

        public Boolean getDisponivel() {
            return disponivel;
        }

        public void setDisponivel(Boolean disponivel) {
            this.disponivel = disponivel;
        }
    }
}



