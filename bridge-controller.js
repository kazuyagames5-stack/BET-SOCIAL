/**
 * BET SOCIAL - BRIDGE CONTROLLER V2.0 (QUANTUM SENTINEL)
 * Sincronização de Alta Performance entre Fluxo Financeiro e Odds Engine
 * Arquitetura de Microserviços e Proteção de Banca
 * Segurança Nível Bancário: Maicon Sanches (16146178721)
 */

const BridgeSystem = {
    settings: {
        thresholds: {
            critico: 0.20,         // Gatilho de 20% da reserva
            alvo_lucro: 5e9,       // Meta de 5 Bilhões (Notação Científica)
            alerta_fraude: 0.10,   // Alerta se 10% do volume vier de uma única fonte
            margem_agressiva: 0.35, // Proteção máxima em caso de drenagem
            margem_padrao: 0.15
        },
        timeout: 5000 // Time-out de segurança para APIs
    },

    // Estado interno para evitar chamadas redundantes (Memoization)
    state: {
        currentMargin: 0.15,
        isLocked: false,
        lastSync: null
    },

    /**
     * Sincronização Avançada com Lógica de "Circuit Breaker"
     * Previne que uma falha na API trave o sistema inteiro.
     */
    syncFinanceToOdds: async function() {
        const startTime = performance.now();

        try {
            // Execução paralela para ganhar milissegundos críticos
            const [saldoReserva, lucroAtual, volumeApostas] = await Promise.all([
                this.fetchWithTimeout(FinancialCore.getLiquidity()),
                this.fetchWithTimeout(FinancialCore.getTotalProfit()),
                this.fetchWithTimeout(FinancialCore.getVolume24h())
            ]);

            // 1. ANÁLISE DE SAÚDE DA BANCA (Lógica Antifrágil)
            const ratioSeguranca = (saldoReserva / lucroAtual);

            if (ratioSeguranca < this.settings.thresholds.critico) {
                await this.applyEmergencyProtocol("CRÍTICO", this.settings.thresholds.margem_agressiva);
            } 
            else if (volumeApostas > (saldoReserva * 0.5)) {
                // Se o volume de apostas abertas for > 50% da liquidez, endurece as odds preventivamente
                await this.applyEmergencyProtocol("ALTO_RISCO", 0.25);
            }
            else {
                await this.applyEmergencyProtocol("ESTÁVEL", this.settings.thresholds.margem_padrao);
            }

            // 2. MONITORAMENTO DA META DE 5 BILHÕES
            this.checkBillionGoal(lucroAtual);

            this.state.lastSync = new Date().toISOString();
            console.log(`[SYNC SUCCESS] Latência: ${(performance.now() - startTime).toFixed(2)}ms`);

        } catch (error) {
            this.handleSystemFailure(error);
        }
    },

    /**
     * Protocolo de Emergência com Notificação Direta
     */
    applyEmergencyProtocol: async function(status, novaMargem) {
        if (this.state.currentMargin !== novaMargem) {
            await OddsEngine.setMargin(novaMargem);
            this.state.currentMargin = novaMargem;
            
            const msg = `[${status}] Alteração de Margem para ${(novaMargem * 100)}%. Responsável: Maicon Sanches.`;
            await OddsEngine.notifyMaicon(msg);
            
            // Log de auditoria imutável (Simulação)
            console.warn(`AUDIT LOG: ${msg}`);
        }
    },

    /**
     * Verifica progresso da meta e escala o ecossistema de afiliados
     */
    checkBillionGoal: function(lucro) {
        const progresso = (lucro / this.settings.thresholds.alvo_lucro) * 100;
        
        if (lucro >= this.settings.thresholds.alvo_lucro) {
            // Gatilho do Comando 5: Upgrade Automático
            AffiliateEngine.upgradeAllTo30();
            console.log("META ATINGIDA: Upgrade de 30% liberado para todos os afiliados.");
        } else {
            console.log(`PROGRESSO PARA 5 BILHÕES: ${progresso.toFixed(2)}%`);
        }
    },

    /**
     * Fail-Safe (Travamento Total)
     * Se o sistema financeiro cair, ninguém perde dinheiro.
     */
    handleSystemFailure: function(err) {
        this.state.isLocked = true;
        OddsEngine.lockAllMarkets();
        
        const errorMsg = "!!! ALERTA DE SEGURANÇA - PONTE FINANCEIRA ROMPIDA !!!";
        OddsEngine.notifyMaicon(`${errorMsg} Erro: ${err.message}`);
        console.error(errorMsg, err);
    },

    /**
     * Helper para evitar que a Bridge fique esperando uma resposta eterna
     */
    fetchWithTimeout: function(promise) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout de Conexão")), this.settings.timeout)
            )
        ]);
    }
};

// Orquestrador: Execução assíncrona para não travar a Main Thread
const runBridge = async () => {
    while (true) {
        await BridgeSystem.syncFinanceToOdds();
        await new Promise(r => setTimeout(r, 30000)); // Intervalo de 30s
    }
};

runBridge();
