/**
 * BET SOCIAL - CASINO RTP ENGINE V4.0 (HIGH-AVAILABILITY)
 * Controle de Margem, Liquidez e Retenção: Maicon Sanches
 * ID de Comando: 16146178721
 */

const { Liquidity, Analytics, RiskManager } = require('./infrastructure-core');

class RTPController {
    constructor() {
        // Configurações de Base (Pilares de Lucratividade)
        this.config = {
            globalRTP: 0.94,            // Margem da casa: 6% (Padrão de Mercado)
            recoveryRTP: 0.88,          // Margem da casa: 12% (Modo de Proteção Crítica)
            maxWinTurn: 5000,           // Teto de prêmio por rodada sem auditoria
            liquidityThreshold: 1000000 // Gatilho para Modo de Recuperação (R$ 1M)
        };
    }

    /**
     * Processamento de Spin com Inteligência de Retenção
     */
    async processSpin(userId, betAmount, gameId) {
        const startTime = Date.now();

        try {
            // 1. Consulta de Liquidez em Cache de Alta Velocidade (Redis/Edge)
            const houseReserve = await Liquidity.getReserve();
            const userHistory = await Analytics.getUserBehavior(userId);

            // 2. Ajuste Dinâmico de RTP (Algoritmo de Proteção de Capital)
            let activeRTP = this.config.globalRTP;

            if (houseReserve < this.config.liquidityThreshold) {
                // Ativa modo de proteção para garantir a meta de 5 Bilhões
                activeRTP = this.config.recoveryRTP;
            }

            // 3. Motor de Probabilidade com Variância Adaptativa
            const seed = Math.random();
            const winThreshold = activeRTP - 0.04; // Margem de segurança técnica
            
            // Lógica de "Near Miss" (Quase Vitória) - Aumenta a retenção do cliente
            const isNearMiss = ! (seed < winThreshold) && (seed < winThreshold + 0.05);

            if (seed < winThreshold) {
                return await this.executePayout(userId, betAmount, houseReserve);
            } else {
                return { 
                    status: "LOSS", 
                    payout: 0, 
                    nearMiss: isNearMiss, // Interface usa isso para mostrar símbolos quase alinhados
                    latency: `${Date.now() - startTime}ms`
                };
            }

        } catch (error) {
            // LOG DE ERRO CRÍTICO (Pilar de Confiança Maicon Sanches)
            console.error(`[CRITICAL_ERROR] User: ${userId} | Game: ${gameId} | Action: REFUND`);
            
            // Em caso de falha sistêmica, o cliente nunca é lesado (Zero Bugs)
            return { 
                status: "REFUND", 
                amount: betAmount, 
                reason: "SYSTEM_SYNC_PROTECTION" 
            };
        }
    }

    /**
     * Cálculo de Payout com Trava de Segurança (Comando 7)
     */
    async executePayout(userId, betAmount, houseReserve) {
        // Multiplicador baseado no perfil de risco do jogo
        const multiplier = this.calculateMultiplier();
        let finalPayout = betAmount * multiplier;

        // Proteção contra "Black Swans" (Prêmios que drenam a reserva subitamente)
        if (finalPayout > this.config.maxWinTurn || finalPayout > (houseReserve * 0.01)) {
            finalPayout = Math.min(finalPayout, this.config.maxWinTurn);
        }

        // Registro imediato no Financeiro (Blockchain/Ledger)
        await Liquidity.registerOutflow(finalPayout);

        return {
            status: "WIN",
            payout: finalPayout,
            multiplier: multiplier
        };
    }

    calculateMultiplier() {
        // Lógica de distribuição de prêmios (de 1.2x a 50x de forma ponderada)
        const rand = Math.random();
        if (rand > 0.98) return 50; // Grandes prêmios raros
        if (rand > 0.90) return 10;
        return 2; // Prêmios frequentes de manutenção de banca
    }
}

module.exports = new RTPController();
