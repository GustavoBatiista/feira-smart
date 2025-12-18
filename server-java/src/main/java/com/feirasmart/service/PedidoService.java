package com.feirasmart.service;

import com.feirasmart.model.*;
import com.feirasmart.repository.*;
import com.feirasmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private FeiranteRepository feiranteRepository;

    @Autowired
    private FeiraRepository feiraRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Pedido create(UUID clienteId, UUID feiranteId, UUID feiraId, List<ItemPedidoDTO> itensDTO, String observacoes) {
        // Buscar cliente
        User cliente = userRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // Verificar se é cliente
        if (!cliente.getTipo().name().equals("CLIENTE")) {
            throw new RuntimeException("Usuário não é um cliente");
        }

        // Buscar feirante
        Feirante feirante = feiranteRepository.findById(feiranteId)
                .orElseThrow(() -> new RuntimeException("Feirante não encontrado"));

        // Buscar feira
        Feira feira = feiraRepository.findById(feiraId)
                .orElseThrow(() -> new RuntimeException("Feira não encontrada"));

        // Criar o pedido
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setFeirante(feirante);
        pedido.setFeira(feira);
        pedido.setStatus(PedidoStatus.PENDENTE);
        pedido.setObservacoes(observacoes);

        // Criar os itens do pedido
        List<PedidoItem> itens = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (ItemPedidoDTO itemDTO : itensDTO) {
            // Buscar o produto
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            // Verificar se o produto pertence ao feirante
            // Pode verificar pelo feirante diretamente ou pelo user do feirante
            boolean produtoPertenceAoFeirante = false;
            if (produto.getFeirante() != null && produto.getFeirante().getId().equals(feiranteId)) {
                produtoPertenceAoFeirante = true;
            } else if (produto.getUser() != null && feirante.getUser() != null 
                    && produto.getUser().getId().equals(feirante.getUser().getId())) {
                produtoPertenceAoFeirante = true;
            }
            
            if (!produtoPertenceAoFeirante) {
                throw new RuntimeException("Produto não pertence ao feirante");
            }

            // Verificar estoque
            if (produto.getEstoque() < itemDTO.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // Criar item do pedido
            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setNomeProduto(itemDTO.getNomeProduto() != null ? itemDTO.getNomeProduto() : produto.getNome());
            item.setQuantidade(itemDTO.getQuantidade());
            item.setPreco(itemDTO.getPreco());

            itens.add(item);

            // Calcular subtotal
            BigDecimal subtotal = itemDTO.getPreco().multiply(BigDecimal.valueOf(itemDTO.getQuantidade()));
            total = total.add(subtotal);
        }

        if (itens.isEmpty()) {
            throw new RuntimeException("Pedido deve ter pelo menos um item");
        }

        pedido.setItens(itens);
        pedido.setTotal(total);

        System.out.println("💾 Salvando pedido:");
        System.out.println("   Cliente ID: " + cliente.getId());
        System.out.println("   Feirante ID: " + feirante.getId());
        System.out.println("   Feira ID: " + feira.getId());
        System.out.println("   Total: " + total);
        System.out.println("   Quantidade de itens: " + itens.size());

        // Salvar o pedido (os itens serão salvos automaticamente devido ao cascade)
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        
        System.out.println("✅ Pedido salvo com sucesso:");
        System.out.println("   Pedido ID: " + pedidoSalvo.getId());
        System.out.println("   Cliente ID no pedido salvo: " + pedidoSalvo.getCliente().getId());
        
        return pedidoSalvo;
    }

    // DTO interno para receber os itens do pedido
    public static class ItemPedidoDTO {
        private UUID produtoId;
        private String nomeProduto;
        private Integer quantidade;
        private BigDecimal preco;

        public UUID getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(UUID produtoId) {
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
