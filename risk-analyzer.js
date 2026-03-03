/**
 * BET SOCIAL - IA DE GERENCIAMENTO DE RISCO V2.0 (MODO PREDITIVO)
 * Monitoramento de integridade e saúde da banca: Maicon Sanches
 * Foco: Proteção de Liquidez, Detecção de Bots e Antifraude de Grupos de Sinais.
 */

const crypto = require('crypto');

class RiskAI_Ultra {
    constructor() {
        // Configurações de Escala Global
        this.profitTarget = 5000000000;         // Meta: 5 Bilhões
        this.suspiciousWinRate = 0.72;          // Reduzido para 72% (Ninguém humano mantém 85% de forma orgânica)
        this.maxSinglePayout = 50000;           // Teto automático
        this.velocityLimit = 5;                 // Máximo de apostas por segundo (Anti-Spam/Bot)
        this.exposureLimit = 10000000;          // Exposição máxima simultânea da casa (10M)
    }

    async analyzeUser(userId, betData, sessionInfo) {
        try {
            const history = await db.getUserHistory(userId);
            const globalExposure = await db.getGlobalExposure();

            // 0. Válvula de Escape: Proteção de Liquidez da Casa
            if (globalExposure + betData.potentialWin > this.exposureLimit) {
                return this.triggerAction(userId, "REJECT_BET", "Exposição de Risco da Casa Excedida");
            }

            // 1. Análise de Velocidade e Impressão Digital (Bot Detection)
            if (this.isMachineBehavior(sessionInfo, history)) {
                return this.triggerAction(userId, "SHADOW_BAN", "Padrão de Navegação Não-Humano");
            }

            // 2. Detecção de Arbitragem e Micro-Frações (Melhorado)
            if (this.detectArbBetting(betData)) {
                return this.triggerAction(userId, "LIMIT_BET", "Arbitragem/Bot de Centavos Detectado");
            }

            // 3. Análise de Cluster (Detecção de Grupos de Sinais)
            // Se 500 usuários apostam no mesmo segundo, no mesmo mercado, é um sinal externo.
            if (await this.isGroupSignal(betData.marketId)) {
                return this.triggerAction(userId, "ODDS_ADJUST", "Movimentação Atípica de Mercado");
            }

            // 4. Análise de Sharpe Ratio / Win Rate Evolutivo
            let winRate = history.wins / (history.totalBets || 1);
            if (this.isSuperUser(winRate, history.totalBets)) {
                return this.triggerAction(userId, "MANUAL_REVIEW", "Taxa de acerto estatisticamente impossível");
            }

            // 5. Verificação de Payout Crítico
            if (betData.potentialWin > this.maxSinglePayout) {
                return this.triggerAction(userId, "FLAG_TRANSACTION", "Prêmio Requer Auditoria Humana");
            }

            return { status: "SAFE", action: "NONE", score: this.calculateTrustScore(history) };

        } catch (error) {
            // Em caso de falha na IA, bloqueio preventivo para não quebrar a banca do Maicon
            console.error(`CRITICAL RISK ERROR: ${error.message}`);
            return { status: "ERROR", action: "FREEZE_ACCOUNT", reason: "Falha na Verificação de Integridade" };
        }
    }

    /**
     * Identifica se a aposta tem padrões de bots (ex: frações irracionais ou latência constante)
     */
    detectArbBetting(data) {
        const hasIrregularDecimals = (data.amount % 1 !== 0 && data.amount.toString().split('.')[1]?.length > 2);
        const isCalculatedRisk = (data.amount.toString().includes('33.33') || data.amount.toString().includes('66.66'));
        return hasIrregularDecimals || isCalculatedRisk;
    }

    /**
     * Verifica se o comportamento de cliques e tempo de resposta é de uma máquina
     */
    isMachineBehavior(session, history) {
        // Verifica se o tempo entre apostas é milimetricamente igual (Padrão de Script)
        const intervals = history.recentBetTimes.map((t, i, arr) => i > 0 ? t - arr[i-1] : null).filter(Boolean);
        const standardDeviation = this.getStandardDeviation(intervals);
        return standardDeviation < 50; // Se a variação for < 50ms entre apostas, é um bot.
    }

    isSuperUser(winRate, total) {
        return (total > 15 && winRate > this.suspiciousWinRate);
    }

    async isGroupSignal(marketId) {
        const spike = await cache.get(`market_spike_${marketId}`);
        return spike > 100; // Mais de 100 apostas idênticas em segundos
    }

    getStandardDeviation(array) {
        const n = array.length;
        if (n === 0) return 0;
        const mean = array.reduce((a, b) => a + b) / n;
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    }

    calculateTrustScore(history) {
        // Retorna um score de 0 a 100 para o Admin ver quem é o "bom cliente"
        return Math.min(100, (history.deposits / (history.withdrawals || 1)) * 10);
    }

    triggerAction(userId, type, reason) {
        // Log centralizado para o Maicon Sanches
        const timestamp = new Date().toISOString();
        console.warn(`[!] RISK-AI ALERT | ${timestamp} | User: ${userId} | Action: ${type} | Reason: ${reason}`);
        
        return { 
            status: "WARNING", 
            action: type, 
            message: reason,
            riskId: crypto.randomBytes(4).toString('hex').toUpperCase()
        };
    }
}

module.exports = new RiskAI_Ultra();
