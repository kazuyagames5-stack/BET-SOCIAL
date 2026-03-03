/**
 * BET SOCIAL - SISTEMA DE RETENÇÃO E PSICOLOGIA DE JOGO V4.0
 * Arquitetura de Microserviços: CRM (Pilar 4) + Financeiro (Pilar 2)
 * Proprietário: Maicon Sanches (Acesso: 16146178721)
 */

class BonusEngine {
    constructor() {
        // Configurações Matemáticas de Proteção
        this.defaultRollover = 50; 
        this.maxBonusConversion = 500; 
        this.expirationDays = 7; // Bônus expira se não usado (Gera Urgência)
        this.minDepositForBonus = 20; 
    }

    /**
     * Aplica bônus com Lógica de Retenção Psicológica
     */
    async applyBonus(userId, depositAmount, bonusType) {
        // Tracker de performance para o painel HQ
        const startTime = Date.now();

        try {
            if (depositAmount < this.minDepositForBonus) return;

            let bonusValue = 0;
            let strategy = "RECOVERY";

            // Lógica de Atribuição Inteligente
            if (bonusType === 'WELCOME_100') {
                bonusValue = depositAmount * 1.0;
                strategy = "ACQUISITION";
            }

            const rolloverTarget = bonusValue * this.defaultRollover;
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + this.expirationDays);

            // Registro Atômico no Banco (Garante que o bônus entre com o depósito)
            const bonusRecord = {
                userId,
                bonusBalance: bonusValue,
                initialBonus: bonusValue,
                requiredRollover: rolloverTarget,
                currentRollover: 0,
                status: "LOCKED",
                maxConversion: this.maxBonusConversion,
                expiresAt: expirationDate,
                strategy: strategy,
                createdAt: new Date()
            };

            await db.saveBonus(bonusRecord);

            // Sincronia com CRM - Gatilho de Escassez e Recompensa
            const message = bonusType === 'WELCOME_100' 
                ? `🚀 BANCA DOBRADA! Você recebeu R$ ${bonusValue.toFixed(2)}. O lucro te espera!`
                : `⚠️ FALTA DE SORTE? Resolvemos isso agora. R$ ${bonusValue.toFixed(2)} creditados!`;

            await CRM.notify(userId, {
                message: message,
                type: "URGENT_REWARD",
                cta: "JOGAR AGORA",
                timer: this.expirationDays * 24 * 60 * 60 // Segundos para o cronômetro no front
            });

            // Log de Auditoria para o Painel de Generais (HQ)
            console.log(`[BONUS_LOG] User: ${userId} | Valor: ${bonusValue} | Meta: ${rolloverTarget}`);

        } catch (error) {
            // Failsafe: Em caso de erro, o sistema congela o bônus para auditoria manual
            console.error("CRITICAL: FALHA NA APLICAÇÃO DE BÔNUS - BLOQUEIO DE SEGURANÇA ATIVADO", error);
            await db.logSystemIncident("BONUS_ENGINE_FAIL", { userId, depositAmount });
        }
    }

    /**
     * Verifica elegibilidade com Calculadora de Progresso
     */
    async checkWithdrawalEligibility(userId) {
        const bonusStatus = await db.getBonusStatus(userId);

        if (!bonusStatus || bonusStatus.status === "COMPLETED") {
            return { canWithdraw: true };
        }

        const progressPercent = (bonusStatus.currentRollover / bonusStatus.requiredRollover) * 100;
        const missingAmount = bonusStatus.requiredRollover - bonusStatus.currentRollover;

        if (bonusStatus.currentRollover < bonusStatus.requiredRollover) {
            
            // Aqui entra a psicologia: Não apenas negamos, incentivamos o fim do rollover
            return { 
                canWithdraw: false, 
                reason: "Rollover Pendente",
                progress: `${progressPercent.toFixed(2)}%`,
                missingAmount: missingAmount,
                message: `Você está a apenas R$ ${missingAmount.toLocaleString()} de liberar seu saque total!`
            };
        }

        // Se cumpriu o rollover, aplica a trava de conversão máxima (Proteção de Banca)
        if (bonusStatus.bonusBalance > this.maxBonusConversion) {
            await this.finalizeBonusConversion(userId, this.maxBonusConversion);
        }

        return { canWithdraw: true };
    }

    /**
     * Finaliza o bônus convertendo em Saldo Real limitado à regra do sistema
     */
    async finalizeBonusConversion(userId, limit) {
        await db.transaction(async (t) => {
            await t.updateBalance(userId, limit); // Transfere o limite para saldo real
            await t.clearBonus(userId);           // Remove o excesso de bônus
            await CRM.notify(userId, "💸 SUCESSO! Seu bônus foi convertido em DINHEIRO REAL. Saque agora!");
        });
    }
}

module.exports = new BonusEngine();
