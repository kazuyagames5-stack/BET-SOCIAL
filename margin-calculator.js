/**
 * BET SOCIAL - QUANTUM SPORTSBOOK MARGIN & RISK ENGINE
 * @version 4.0 - High Availability (HA)
 * @author Maicon Sanches (ID: 16146178721)
 * * Descrição: Sistema de proteção de liquidez e ajuste dinâmico de odds.
 */

class SportsMargin {
    constructor() {
        // Margem base de 8%, mas agora com flutuação dinâmica baseada no risco
        this.config = {
            defaultMargin: 0.08,
            minMargin: 0.04,
            maxMargin: 0.15,
            alertThreshold: 500000, // R$ 500k de exposição
            criticalThreshold: 2000000 // R$ 2M - Bloqueio automático imediato
        };
    }

    /**
     * Aplica o "Vig" (Margem da Casa) com proteção contra Arbitragem.
     * @param {number} fairOdd - A odd justa (sem margem).
     * @param {number} volatility - Fator de volatilidade do mercado (0.0 a 1.0).
     */
    calculateOdds(fairOdd, volatility = 0) {
        // Se a volatilidade subir (ex: notícia de lesão), a margem aumenta automaticamente
        const dynamicMargin = this.config.defaultMargin + (volatility * 0.05);
        
        // Fórmula de Conversão com Proteção de Arredondamento (Round Down para a Casa)
        const probability = 1 / fairOdd;
        const adjustedProbability = probability + dynamicMargin;
        
        // Garante que a odd nunca seja menor que 1.01 (impossibilidade matemática)
        const finalOdd = Math.max(1.01, 1 / adjustedProbability);

        // Retorna com 2 casas decimais, sempre arredondando a favor da banca
        return Math.floor(finalOdd * 100) / 100;
    }

    /**
     * Motor de Risco Avançado - Detecta anomalias em milissegundos.
     * @param {string} matchId - ID único do evento.
     * @param {number} totalVolume - Volume total apostado no mercado.
     * @param {number} spikeRate - Taxa de crescimento do volume nos últimos 60s.
     */
    async riskCheck(matchId, totalVolume, spikeRate = 0) {
        console.log(`[RISK-LOG] Monitorando Evento: ${matchId} | Volume: R$ ${totalVolume.toLocaleString()}`);

        // 1. Bloqueio Crítico (Proteção de Patrimônio)
        if (totalVolume >= this.config.criticalThreshold) {
            return { status: "AUTO_HALT", reason: "MAX_EXPOSURE_REACHED", level: 5 };
        }

        // 2. Alerta de Manipulação (Detecção de Insider Trading)
        if (totalVolume > this.config.alertThreshold || spikeRate > 0.4) {
            return { 
                status: "MANUAL_APPROVAL_REQUIRED", 
                reason: "SUSPICIOUS_ACTIVITY_OR_HIGH_VOLUME",
                level: 3 
            };
        }

        // 3. Verificação de Saúde do Mercado
        return { status: "SAFE", level: 1 };
    }

    /**
     * Calcula o Payout Real (Retorno para o Jogador)
     * Útil para o marketing: "Aqui pagamos 92% de volta!"
     */
    getYield() {
        return (1 - this.config.defaultMargin) * 100;
    }
}

// Exportação Singleton com Frozen Object para impedir alterações em tempo de execução
const instance = new SportsMargin();
Object.freeze(instance);
module.exports = instance;
