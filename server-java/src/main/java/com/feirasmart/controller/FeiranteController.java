package com.feirasmart.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.feirasmart.config.JwtUserExtractor;
import com.feirasmart.model.Feira;
import com.feirasmart.model.Feirante;
import com.feirasmart.model.User;
import com.feirasmart.service.DashboardStatsService;
import com.feirasmart.service.FeiranteService;
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
@RequestMapping("/api/feirantes")
@CrossOrigin(origins = "*")
public class FeiranteController {
    @Autowired
    private FeiranteService feiranteService;

    @Autowired
    private DashboardStatsService dashboardStatsService;

    @Autowired
    private JwtUserExtractor jwtUserExtractor;

    @GetMapping
    public ResponseEntity<List<Feirante>> getAll(
            @RequestParam(required = false) UUID feira_id,
            @RequestParam(required = false) UUID user_id) {
        return ResponseEntity.ok(feiranteService.findAll(feira_id, user_id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feirante> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(feiranteService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/stats/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            if (!user.getTipo().name().equals("FEIRANTE")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(dashboardStatsService.getDashboardStats(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/minhas-feiras")
    public ResponseEntity<List<Map<String, Object>>> getMinhasFeiras(HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            if (!user.getTipo().name().equals("FEIRANTE")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            List<Feirante> feirantes = feiranteService.findAll(null, user.getId());
            List<Map<String, Object>> resultado = feirantes.stream().map(feirante -> {
                Map<String, Object> item = new HashMap<>();
                item.put("feiranteId", feirante.getId());
                item.put("nomeEstande", feirante.getNomeEstande());
                item.put("descricao", feirante.getDescricao());
                item.put("categoria", feirante.getCategoria());
                item.put("avatar", feirante.getAvatar());
                
                Feira feira = feirante.getFeira();
                if (feira != null) {
                    Map<String, Object> feiraData = new HashMap<>();
                    feiraData.put("id", feira.getId());
                    feiraData.put("nome", feira.getNome());
                    feiraData.put("localizacao", feira.getLocalizacao());
                    feiraData.put("descricao", feira.getDescricao());
                    feiraData.put("diaDaSemana", feira.getDiaDaSemana());
                    feiraData.put("horaInicio", feira.getHoraInicio());
                    feiraData.put("horaFim", feira.getHoraFim());
                    feiraData.put("imagem", feira.getImagem());
                    item.put("feira", feiraData);
                }
                
                return item;
            }).toList();
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(
            HttpServletRequest request,
            @RequestBody CreateFeiranteRequest createRequest) {
        try {
            System.out.println("📥 POST /api/feirantes - Requisição recebida");
            System.out.println("📥 Body recebido: " + createRequest);
            
            User user = jwtUserExtractor.extractUser(request);
            System.out.println("✅ Usuário extraído: " + user.getId() + " - " + user.getTipo());
            
            if (!user.getTipo().name().equals("FEIRANTE")) {
                System.out.println("❌ Usuário não é feirante: " + user.getTipo());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Apenas feirantes podem se cadastrar em feiras");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Feirante feirante = feiranteService.create(
                    user.getId(),
                    createRequest.getFeiraId(),
                    createRequest.getNomeEstande(),
                    createRequest.getDescricao(),
                    createRequest.getCategoria(),
                    createRequest.getAvatar()
            );
            System.out.println("✅ Feirante criado com sucesso: " + feirante.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(feirante);
        } catch (RuntimeException e) {
            System.out.println("❌ RuntimeException ao criar feirante: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Erro ao criar feirante");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.out.println("❌ Exception ao criar feirante: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro de autenticação ou autorização");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feirante> update(
            @PathVariable UUID id,
            HttpServletRequest request,
            @RequestBody UpdateFeiranteRequest updateRequest) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            return ResponseEntity.ok(feiranteService.update(
                    id,
                    user.getId(),
                    updateRequest.getNomeEstande(),
                    updateRequest.getDescricao(),
                    updateRequest.getCategoria(),
                    updateRequest.getAvatar()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable UUID id,
            HttpServletRequest request) {
        try {
            User user = jwtUserExtractor.extractUser(request);
            
            if (!user.getTipo().name().equals("FEIRANTE")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Apenas feirantes podem remover suas barracas");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            feiranteService.delete(id, user.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Barraca removida com sucesso");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Barraca não encontrada");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro de autenticação ou autorização");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private static class CreateFeiranteRequest {
        @JsonProperty("feira_id")
        private UUID feiraId;
        
        @JsonProperty("nome_estande")
        private String nomeEstande;
        
        private String descricao;
        private String categoria;
        private String avatar;

        public UUID getFeiraId() {
            return feiraId;
        }

        @JsonProperty("feira_id")
        public void setFeiraId(UUID feiraId) {
            this.feiraId = feiraId;
        }

        public String getNomeEstande() {
            return nomeEstande;
        }

        @JsonProperty("nome_estande")
        public void setNomeEstande(String nomeEstande) {
            this.nomeEstande = nomeEstande;
        }

        public String getDescricao() {
            return descricao;
        }

        public void setDescricao(String descricao) {
            this.descricao = descricao;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }
        
        @Override
        public String toString() {
            return "CreateFeiranteRequest{" +
                    "feiraId=" + feiraId +
                    ", nomeEstande='" + nomeEstande + '\'' +
                    ", descricao='" + descricao + '\'' +
                    ", categoria='" + categoria + '\'' +
                    ", avatar='" + avatar + '\'' +
                    '}';
        }
    }

    private static class UpdateFeiranteRequest {
        private String nomeEstande;
        private String descricao;
        private String categoria;
        private String avatar;

        public String getNomeEstande() {
            return nomeEstande;
        }

        public void setNomeEstande(String nomeEstande) {
            this.nomeEstande = nomeEstande;
        }

        public String getDescricao() {
            return descricao;
        }

        public void setDescricao(String descricao) {
            this.descricao = descricao;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }
    }
}






