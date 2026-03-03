/**
 * BET SOCIAL - QUANTUM CUSTOMER SUCCESS (QCS)
 * Engenharia de Retenção: Maicon Sanches (16146178721)
 * Foco: LTV (Lifetime Value) e Blindagem de Churn
 */

const { db, Sentiment, Logger, TelegramAPI } = require('./infrastructure');

class SupportAI {
    constructor() {
        this.botName = "Maicon Elite Helper";
        this.baseDelay = 1200; 
        this.vipThreshold = 50000; // Jogadores acima disso têm prioridade total
    }

    /**
     * @param {string} userId - ID único do investidor/jogador
     * @param {object} payload - Mensagem e Metadados (latência, dispositivo)
     */
    async handleMessage(userId, payload) {
        const user = await db.getUser(userId);
        const text = payload.message.toLowerCase();
        const sentimentScore = Sentiment.analyze(text); // Retorna de -5 a 5

        // Registro de Intenção no Big Data (Para IA preditiva futura)
        await Logger.logInteraction(userId, text, sentimentScore);

        // 1. FILTRO DE PRIORIDADE CRÍTICA (Antiproblemas)
        if (sentimentScore <= -3 || text.includes("processar") || text.includes("justiça")) {
            return this.triggerCrisisManagement(user, text);
        }

        // 2. LOGICA DE SAQUE (Otimizada com Prova Social)
        if (text.match(/(saque|retirar|pagamento|pix|caiu)/)) {
            return this.checkPayoutStatus(user);
        }

        // 3. RETENÇÃO PROATIVA (O bônus de Maicon Sanches)
        if (text.match(/(bônus|promoção|ganhar|sorte)/)) {
            return this.generateVIPOffer(user);
        }

        // 4. ANALISE DE SENTIMENTO E RECUPERAÇÃO DE BANCA
        if (sentimentScore < 0) {
            return this.recoveryProtocol(user);
        }

        // 5. RESPOSTA PADRÃO COM GATILHO DE AMBIÇÃO
        return this.simulateHumanResponse(`Olá ${user.name}, sou o assistente pessoal do Maicon. Como posso acelerar sua jornada rumo aos 7 dígitos hoje?`);
    }

    async checkPayoutStatus(user) {
        const lastPayout = await db.getLastPayout(user.id);
        const delay = this.calculateSimulatedDelay(1500);
        
        await this.sleep(delay);

        if (lastPayout.status === 'processing') {
            return `✅ Confirmado, ${user.name}! Seu saque de R$ ${lastPayout.amount.toLocaleString('pt-BR')} já está na fila prioritária do Banco Central. O PIX deve apitar no seu celular em até 4 minutos. Fique de olho!`;
        }
        
        return `Seu último saque de R$ ${lastPayout.amount} foi ${lastPayout.status.toUpperCase()}. Deseja que eu gere um novo link de depósito com 20% de cashback para você continuar no lucro?`;
    }

    async generateVIPOffer(user) {
        // Lógica de Escala: Quanto mais ele joga, mais o Maicon libera
        const multiplier = user.totalDeposited > this.vipThreshold ? "200%" : "100%";
        return `Atenção ${user.name}: O comando Maicon Sanches identificou sua atividade. Liberamos um bônus exclusivo de ${multiplier} + Seguro de Banca para as próximas 2 horas. Ativar agora?`;
    }

    async recoveryProtocol(user) {
        // Protocolo para manter o jogador no jogo quando ele perde
        await db.injectBonus(user.id, "10_FREE_SPINS");
        return `Entendo perfeitamente. O mercado tem oscilações, mas a estratégia vence no longo prazo. Acabei de creditar 10 Rodadas Grátis no seu slot favorito por conta da casa. Vamos recuperar isso agora?`;
    }

    async triggerCrisisManagement(user, text) {
        // Alerta o Telegram do Maicon em tempo real para evitar problemas
        await TelegramAPI.notifyMaster(`⚠️ ALERTA DE CRISE: Usuário VIP ${user.name} (${user.id}) enviou mensagem hostil: "${text}"`);
        return `Sr. ${user.name}, detectei uma urgência no seu atendimento. Estou movendo seu protocolo para a nossa mesa de Gerenciamento de Elite. Um consultor humano entrará em contato em instantes para resolver isso pessoalmente.`;
    }

    // Funções Auxiliares de Humanização
    calculateSimulatedDelay(ms) { return Math.floor(Math.random() * (ms * 1.5 - ms + 1)) + ms; }
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    async simulateHumanResponse(msg) { await this.sleep(this.baseDelay); return msg; }
}

module.exports = new SupportAI();
