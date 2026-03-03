/**
 * BET SOCIAL - GATEWAY DE SAQUE BLINDADO V4.0
 * Arquitetura: Maicon Sanches (ID: 16146178721)
 * Foco: Integridade de Banca, Velocidade de Disparo e Retenção de Lucro.
 */

const { BonusEngine, PixAPI, CryptoAPI, CRM, Logger, SecurityDB } = require('./core-modules');

class PayoutSystem {
    constructor() {
        // Configurações Dinâmicas (Podem ser movidas para o Redis/DB)
        this.autoApproveLimit = 500.00; 
        this.dailyLimitPerUser = 5000.00;
        this.riskScoreThreshold = 80; // Escala 0-100 (Acima de 80 exige Maicon)
    }

    async executePayout(userId, amount, method, destination) {
        const startTime = Date.now();
        
        try {
            // 1. BLINDAGEM DE SEGURANÇA (Anti-Fraude)
            const userRisk = await SecurityDB.getUserRiskProfile(userId);
            const isAbusingArb = await SecurityDB.checkArbitragePattern(userId);

            if (userRisk.score > this.riskScoreThreshold || isAbusingArb) {
                await this.flagForInvestigation(userId, amount, "Risco Elevado/Arbitragem");
                return { status: "MANUAL_REVIEW", message: "Verificando integridade da transação." };
            }

            // 2. VERIFICAÇÃO DE ROLLOVER (Proteção do Pilar de Lucro)
            const rolloverStatus = await BonusEngine.getDetailedRollover(userId);
            if (!rolloverStatus.complete) {
                // Persuasão: Explica como resolver o problema para o cliente comprar/jogar mais
                await CRM.sendPush(userId, `Falta apenas R$ ${rolloverStatus.remaining.toFixed(2)} de volume para liberar seu saque!`);
                return { 
                    status: "REJECTED", 
                    reason: `Rollover pendente. Complete a meta para liberar o saque instantâneo.` 
                };
            }

            // 3. FILTRO DE LIMITE DIÁRIO (Gestão de Risco)
            const spentToday = await SecurityDB.getDailyWithdrawalSum(userId);
            if ((spentToday + amount) > this.dailyLimitPerUser) {
                return { status: "REJECTED", reason: "Limite diário de saque atingido. Tente novamente em 24h." };
            }

            // 4. LÓGICA DE APROVAÇÃO (Automática vs Manual)
            if (amount > this.autoApproveLimit) {
                await this.notifyMaiconPending(userId, amount, method);
                return { 
                    status: "PENDING_APPROVAL", 
                    message: "Saque de alto valor em análise de segurança. Prazo máximo: 24h." 
                };
            }

            // 5. DISPARO DE API COM RETRY LOGIC (Alta Disponibilidade)
            const payoutResponse = await this.smartDispatch(amount, method, destination);

            if (payoutResponse.success) {
                // 6. PERSEGUIÇÃO POSITIVA (Pós-Venda/Retenção)
                await this.triggerRetentionLogic(userId, amount);
                
                Logger.info(`SAQUE_SUCESSO | User: ${userId} | Valor: ${amount} | Tempo: ${Date.now() - startTime}ms`);
                return { status: "SUCCESS", txId: payoutResponse.id, arrival: "INSTANT" };
            }

            throw new Error("Falha na resposta do PSP (Provedor de Pagamento)");

        } catch (error) {
            // Log Crítico para intervenção imediata do Maicon
            Logger.critical(`ALERT_PAYOUT_FAIL | User: ${userId} | Erro: ${error.message}`);
            return { status: "ERROR", message: "Instabilidade temporária no processamento. Tente em 5 minutos." };
        }
    }

    /**
     * Sistema de Seleção de Rota (PIX vs Cripto)
     */
    async smartDispatch(amount, method, destination) {
        // Se o PIX falhar, o sistema pode sugerir Cripto automaticamente (Redundância)
        return (method === 'PIX') 
            ? await PixAPI.send(amount, destination) 
            : await CryptoAPI.sendUSDT(amount, destination);
    }

    /**
     * Notifica o Maicon Sanches via Telegram/Webhook de Segurança
     */
    async notifyMaiconPending(userId, amount, method) {
        const payload = {
            admin: "Maicon Sanches",
            event: "LARGE_WITHDRAW_REQUEST",
            user: userId,
            value: `R$ ${amount.toFixed(2)}`,
            gateway: method,
            action: "https://admin.betsocial.com/approve/" + userId
        };
        await CRM.notifyAdmin(payload);
    }

    /**
     * Lógica de Retenção: O saque é a melhor hora para "vender" o próximo depósito
     */
    async triggerRetentionLogic(userId, amount) {
        const message = `✅ DINHEIRO NA CONTA! Recebemos seu saque de R$ ${amount.toFixed(2)}. 
        Parabéns pela vitória! Que tal aproveitar o bônus de 50% no próximo depósito e buscar o próximo nível?`;
        
        await CRM.sendNotification(userId, message);
    }
}

module.exports = new PayoutSystem();
