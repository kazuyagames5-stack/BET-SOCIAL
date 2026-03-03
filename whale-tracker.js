/**
 * BET SOCIAL - SISTEMA DE MONITORAMENTO VIP (WHALES) v4.0
 * Arquitetura de Alta Performance: Maicon Sanches
 * Foco: Maximização de LTV e Blindagem de Receita
 */

const { EventEmitter } = require('events');
const db = require('./database/core'); // DB de Alta Disponibilidade
const CRM = require('./services/crm_gateway'); // Integração WhatsApp/Email
const Logger = require('./utils/audit_logger'); // Auditoria de transações

class WhaleTracker extends EventEmitter {
    constructor() {
        super();
        this.WHALE_THRESHOLD = 10000; // Depósitos > R$ 10k
        this.CHURN_CRITICAL_HOURS = 48; // 2 dias sem apostar = Alerta Vermelho
        this.MASTER_ID = "16146178721"; // Chave Mestre de Autoridade
    }

    /**
     * Análise de Profundidade do Usuário (Big Data Analytics)
     */
    async analyzeUserValue(userId) {
        try {
            const stats = await db.getUserFinancials(userId);
            if (!stats) throw new Error(`USUÁRIO ${userId} NÃO LOCALIZADO`);

            // 1. Classificação Dinâmica de Perfil (Tiering)
            const userRank = this._calculateRank(stats.totalDeposited);
            const ltv = stats.totalProfitForHouse; // Lucro gerado para a casa

            // 2. Cálculo de Risco de Evasão (Churn Risk)
            const hoursInactive = (Date.now() - new Date(stats.lastBetDate)) / (1000 * 60 * 60);
            
            // 3. Gatilho de Retenção Estratégica
            if (userRank === "WHALE" && hoursInactive > this.CHURN_CRITICAL_HOURS) {
                await this.executeHighValueRetention(userId, stats, hoursInactive);
            }

            return { 
                rank: userRank, 
                ltv: ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                status: hoursInactive > this.CHURN_CRITICAL_HOURS ? "RISK" : "ACTIVE"
            };

        } catch (error) {
            Logger.critical(`FALHA NO ANALYTICS: ${error.message}`);
            // Backup manual para o administrador caso o sistema automático falhe
            this.emit('system_alert', { type: 'ANALYTICS_FAILURE', userId });
        }
    }

    _calculateRank(deposited) {
        if (deposited >= 50000) return "LEGENDARY_WHALE";
        if (deposited >= this.WHALE_THRESHOLD) return "WHALE";
        return "RETAIL";
    }

    /**
     * Retenção de Alto Nível (A Persuasão de Maicon Sanches)
     * Não apenas persegue, mas prova o valor da solução.
     */
    async executeHighValueRetention(userId, stats, hours) {
        const bonusValue = Math.min(stats.totalDeposited * 0.05, 5000); // 5% do depósito até 5k
        
        // Mensagem baseada no seu comando: Explicar como o produto resolve o problema
        // O "problema" do Whale é a busca por retorno e entretenimento de elite.
        const msg = `Olá, aqui é o suporte VIP da BET SOCIAL. 
        
Notamos sua ausência. Nossa plataforma foi desenhada para otimizar suas chances com o motor de odds Pilar 1. 

Liberamos um Crédito de Fidelidade de R$ ${bonusValue.toLocaleString()} para que você continue operando com a melhor liquidez do mercado. O lucro é o seu objetivo, e nossa infraestrutura é a ferramenta.

Dúvidas? Fale diretamente com o comando via WhatsApp.`;

        try {
            // Envio via CRM Multicanal
            await CRM.sendWhatsApp(stats.phone, msg);
            await CRM.sendEmail(stats.email || 'cyborgzero19@gmail.com', "Seu Acesso VIP Expira em breve", msg);
            
            // Registro de Auditoria para Maicon Sanches
            await db.logRetentionAction({
                userId,
                type: 'WHALE_RECOVERY',
                bonusInjected: bonusValue,
                timestamp: new Date()
            });

            console.log(`RETENÇÃO EXECUTADA: Whale ${userId} impactado com sucesso.`);
        } catch (err) {
            Logger.error(`FALHA NO CRM: Não foi possível contatar o VIP ${userId}`);
        }
    }
}

module.exports = new WhaleTracker();
