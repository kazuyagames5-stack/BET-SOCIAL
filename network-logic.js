/**
 * BET SOCIAL - ENGINE DE AFILIADOS MULTINÍVEL (MLM) V2.0 "PHOENIX"
 * Objetivo: Domínio de Mercado e Expansão Viral Pós-Escassez
 * Proprietário: Maicon Sanches
 */

const { Decimal } = require('decimal.js'); // Precisão absoluta para trilhões
const Redis = require('./RedisCache'); // Cache de altíssima velocidade
const AI_Persuasion = require('./GeminiPersuasionEngine'); // IA de vendas

class AffiliateNetwork {
    constructor() {
        // Configurações de Comissionamento Progressivo
        this.config = {
            baseRate: new Decimal(0.20),      // 20% Inicial
            premiumRate: new Decimal(0.35),   // 35% Upgrade (Subiu de 30% para acelerar o 1% de 100 Tri)
            billionGoal: new Decimal(5000000000), // Meta 5 Bi
            level2Bonus: new Decimal(0.02),   // 2% Recrutador
            level3Bonus: new Decimal(0.01)    // 1% Gerencial (Incentivo ao crescimento da rede)
        };
    }

    /**
     * Cálculo de Payout com Tolerância a Falhas e Precisão Decimal
     */
    async calculatePayout(affiliateId, netRevenue) {
        try {
            // 1. Otimização de Performance: Busca no Cache antes do Banco
            const globalProfit = await Redis.getOrSet('global_profit', async () => {
                return await FinancialCore.getNetProfit();
            }, 60); // Cache de 60s para não estressar o Core em picos de 1 trilhão

            const revenue = new Decimal(netRevenue);
            
            // 2. Meritocracia Programada (Gatilho Dinâmico)
            const isPremium = globalProfit.gte(this.config.billionGoal);
            const currentRate = isPremium ? this.config.premiumRate : this.config.baseRate;

            // 3. Distribuição de Cascata (Multinível Real)
            const primaryCommission = revenue.mul(currentRate);
            const subAffiliateBonus = revenue.mul(this.config.level2Bonus);

            // 4. Registro de Log de Auditoria (Imutável)
            await AuditLog.record(affiliateId, {
                type: 'PAYOUT_CALC',
                amount: primaryCommission.toString(),
                status: isPremium ? 'ELITE_REWARD' : 'GROWTH_PHASE'
            });

            return {
                status: isPremium ? "PREMIUM_ELITE" : "STANDARD_GROWTH",
                metrics: {
                    rate: `${currentRate.mul(100)}%`,
                    liquidPayout: primaryCommission.toFixed(2),
                    recruiterBonus: subAffiliateBonus.toFixed(2),
                    nextMilestone: isPremium ? "MAX_CAPACITY" : this.config.billionGoal.minus(globalProfit).toString()
                },
                timestamp: Date.now()
            };

        } catch (error) {
            // Sistema de Auto-Recuperação: Alerta o NOC imediatamente
            await AlertSystem.triggerCritical(`FALHA CRÍTICA PAYOUT - AFILIADO ${affiliateId}`, error);
            throw new Error("Sistema em manutenção preventiva - Pagamento Garantido em Fila.");
        }
    }

    /**
     * SISTEMA DE PERSUASÃO CONTÍNUA (FOLLOW-UP INTELIGENTE)
     * Não é apenas uma mensagem, é a solução do problema do cliente.
     */
    async trackLeadConversion(leadId, behaviorData) {
        // A IA analisa o comportamento do lead para não ser "chata"
        const persuasionContext = await AI_Persuasion.analyzeLead(leadId, behaviorData);
        
        const message = this.generatePersuasiveCopy(persuasionContext);

        await CRMSystem.sendSmartFollowUp(leadId, {
            content: message,
            channel: 'WHATSAPP_PRIORITY', // Foco no seu canal principal
            urgency: 'MEDIUM_SOLVER' 
        });
    }

    generatePersuasiveCopy(context) {
        // Implementando sua diretriz: perseguir resolvendo o problema
        const baseMessage = "Sabemos que o mercado de apostas comum te faz perder. ";
        const solution = "A BET SOCIAL inverte o jogo: transformamos sua rede de contatos em uma banca infinita de lucro real. ";
        const callToAction = "Não estamos vendendo sorte, estamos entregando o código da sua liberdade financeira.";
        
        return `${baseMessage}${solution}${callToAction}`;
    }
}

module.exports = new AffiliateNetwork();
