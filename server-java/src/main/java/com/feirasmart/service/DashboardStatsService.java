package com.feirasmart.service;

import com.feirasmart.repository.FeiranteRepository;
import com.feirasmart.repository.ProdutoRepository;
import com.feirasmart.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DashboardStatsService {
    @Autowired
    private FeiranteRepository feiranteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    public Map<String, Object> getDashboardStats(UUID userId) {
        Map<String, Object> stats = new HashMap<>();

        var feirantes = feiranteRepository.findByUser(userId);
        if (feirantes.isEmpty()) {
            stats.put("produtosAtivos", 0);
            stats.put("pedidosHoje", 0);
            stats.put("faturamentoHoje", 0.0);
            stats.put("crescimento", 0.0);
            return stats;
        }

        Long produtosAtivos = produtoRepository.countProdutosAtivosByUserId(userId);
        stats.put("produtosAtivos", produtosAtivos != null ? produtosAtivos : 0);

        LocalDate hoje = LocalDate.now();
        LocalDateTime hojeInicio = LocalDateTime.of(hoje, LocalTime.MIN);
        LocalDateTime hojeFim = LocalDateTime.of(hoje.plusDays(1), LocalTime.MIN);

        Long pedidosHoje = pedidoRepository.countPedidosHojeByUserId(userId, hojeInicio, hojeFim);
        stats.put("pedidosHoje", pedidosHoje != null ? pedidosHoje : 0);

        Double faturamentoHoje = pedidoRepository.sumFaturamentoHojeByUserId(userId, hojeInicio, hojeFim);
        stats.put("faturamentoHoje", faturamentoHoje != null ? Math.round(faturamentoHoje * 100.0) / 100.0 : 0.0);

        LocalDate agora = LocalDate.now();
        int diaDaSemana = agora.getDayOfWeek().getValue();
        LocalDate inicioSemanaAtual = agora.minusDays(diaDaSemana - 1);
        LocalDate inicioSemanaPassada = inicioSemanaAtual.minusDays(7);
        LocalDate fimSemanaPassada = inicioSemanaAtual.minusDays(1);

        LocalDateTime inicioSemanaAtualDT = LocalDateTime.of(inicioSemanaAtual, LocalTime.MIN);
        LocalDateTime inicioSemanaPassadaDT = LocalDateTime.of(inicioSemanaPassada, LocalTime.MIN);
        LocalDateTime fimSemanaPassadaDT = LocalDateTime.of(fimSemanaPassada, LocalTime.MAX);

        Double semanaAtual = calcularFaturamentoPeriodo(userId, inicioSemanaAtualDT, LocalDateTime.now());
        Double semanaPassada = calcularFaturamentoPeriodo(userId, inicioSemanaPassadaDT, fimSemanaPassadaDT);

        double crescimento = 0.0;
        if (semanaPassada > 0) {
            crescimento = ((semanaAtual - semanaPassada) / semanaPassada) * 100;
        } else if (semanaAtual > 0) {
            crescimento = 100.0;
        }

        stats.put("crescimento", Math.round(crescimento * 10.0) / 10.0);

        return stats;
    }

    private Double calcularFaturamentoPeriodo(UUID userId, LocalDateTime inicio, LocalDateTime fim) {
        Double result = pedidoRepository.sumFaturamentoPeriodo(userId, inicio, fim);
        return result != null ? result : 0.0;
    }
}

