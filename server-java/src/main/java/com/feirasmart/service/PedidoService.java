package com.feirasmart.service;

import com.feirasmart.model.*;
import com.feirasmart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private PedidoItemRepository pedidoItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeiranteRepository feiranteRepository;

    @Autowired
    private FeiraRepository feiraRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Pedido> findByClienteId(UUID clienteId) {
        List<Pedido> pedidos = pedidoRepository.findByClienteIdOrderByCreatedAtDesc(clienteId);
        for (Pedido pedido : pedidos) {
            if (pedido.getItens() == null) {
                pedido.setItens(pedidoItemRepository.findByPedidoId(pedido.getId()));
            }
        }
        return pedidos;
    }

    public List<Pedido> findByFeiranteUserId(UUID userId) {
        List<Pedido> pedidos = pedidoRepository.findByFeiranteUserId(userId);
        for (Pedido pedido : pedidos) {
            if (pedido.getItens() == null) {
                pedido.setItens(pedidoItemRepository.findByPedidoId(pedido.getId()));
            }
        }
        return pedidos;
    }

    public Pedido findById(UUID id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
    }

    @Transactional
    public Pedido create(UUID clienteId, UUID feiranteId, UUID feiraId, List<PedidoItemDTO> itensDTO, String observacoes) {
        User cliente = userRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        Feirante feirante = feiranteRepository.findById(feiranteId)
                .orElseThrow(() -> new RuntimeException("Feirante não encontrado"));
        
        Feira feira = feiraRepository.findById(feiraId)
                .orElseThrow(() -> new RuntimeException("Feira não encontrada"));

        BigDecimal total = BigDecimal.ZERO;
        for (PedidoItemDTO itemDTO : itensDTO) {
            BigDecimal itemTotal = itemDTO.getPreco().multiply(BigDecimal.valueOf(itemDTO.getQuantidade()));
            total = total.add(itemTotal);
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setFeirante(feirante);
        pedido.setFeira(feira);
        pedido.setTotal(total);
        pedido.setStatus(PedidoStatus.PENDENTE);
        pedido.setObservacoes(observacoes);

        pedido = pedidoRepository.save(pedido);

        for (PedidoItemDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setNomeProduto(itemDTO.getNomeProduto());
            item.setQuantidade(itemDTO.getQuantidade());
            item.setPreco(itemDTO.getPreco());

            pedidoItemRepository.save(item);
        }

        pedido.setItens(pedidoItemRepository.findByPedidoId(pedido.getId()));
        return pedido;
    }

    @Transactional
    public Pedido updateStatus(UUID pedidoId, UUID userId, PedidoStatus newStatus) {
        Pedido pedido = findById(pedidoId);
        
        if (!pedido.getFeirante().getUser().getId().equals(userId)) {
            throw new RuntimeException("Pedido não encontrado ou não pertence ao feirante");
        }

        PedidoStatus statusAnterior = pedido.getStatus();

        if (newStatus == PedidoStatus.ENTREGUE && statusAnterior != PedidoStatus.ENTREGUE) {
            for (PedidoItem item : pedido.getItens()) {
                Produto produto = item.getProduto();
                if (produto.getEstoque() < item.getQuantidade()) {
                    throw new RuntimeException(
                        String.format("Estoque insuficiente para o produto. Estoque disponível: %d, quantidade pedida: %d",
                            produto.getEstoque(), item.getQuantidade()));
                }

                produto.setEstoque(produto.getEstoque() - item.getQuantidade());
                if (produto.getEstoque() == 0) {
                    produto.setDisponivel(false);
                }
                produtoRepository.save(produto);
            }
        }

        if (newStatus == PedidoStatus.CANCELADO && statusAnterior == PedidoStatus.ENTREGUE) {
            for (PedidoItem item : pedido.getItens()) {
                Produto produto = item.getProduto();
                produto.setEstoque(produto.getEstoque() + item.getQuantidade());
                produto.setDisponivel(true);
                produtoRepository.save(produto);
            }
        }

        pedido.setStatus(newStatus);
        return pedidoRepository.save(pedido);
    }

    public static class PedidoItemDTO {
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

