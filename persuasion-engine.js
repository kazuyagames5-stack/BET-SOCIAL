/**
 * BET SOCIAL - MOTOR DE PERSUASÃO E REMARKETING ULTRA-AVANÇADO
 * Estratégia: Conversão de Alta Precisão (Rumo aos 5B)
 * Desenvolvedor: Maicon Sanches (ID: 16146178721)
 */

const UserDatabase = require('../db/users'); 
const PushNotification = require('../mobile/push-notifications'); 
const Analytics = require('../core/analytics'); // Novo: Monitoramento de Conversão

class PersuasionEngine {
    constructor() {
        // Ciclo de Persuasão Otimizado (Gatilhos Psicológicos)
        this.persuasionCycle = {
            1: { type: 'RAPIDEZ', bonus: 'MAICON200', expires: '4h' },
            2: { type: 'AUTORIDADE', bonus: 'SEGURANCA21', expires: '12h' },
            3: { type: 'ESCASSEZ_MAXIMA', bonus: 'MAICON_FINAL_60', expires: '1h' }
        };
    }

    /**
     * Varredura de Oportunidades
     * Otimizado com processamento em lote (Batch) para não onerar o servidor
     */
    async runPersuasionRoutine() {
        console.log("🔍 [SISTEMA] Iniciando Varredura de Leads Não-Convertidos...");
        
        const potentialPlayers = await UserDatabase.getUsersWithoutDeposit();
        
        // Processamento paralelo para escala de milhões de usuários
        await Promise.all(potentialPlayers.map(async (user) => {
            const daysSinceRegister = this.getDaysDifference(user.registrationDate);
            
            if (this.persuasionCycle[daysSinceRegister]) {
                await this.executeStrategicPush(user, daysSinceRegister);
            }
        }));
    }

    /**
     * O Gatilho de Venda Maicon Sanches
     * Transforma a dor do cliente (medo/lentidão) em solução imediata
     */
    async executeStrategicPush(user, day) {
        const config = this.persuasionCycle[day];
        let payload = {
            title: "💎 MENSAGEM DO SISTEMA",
            body: "",
            url: `https://betsocial.com/deposit?promo=${config.bonus}&utm_source=persuasion&utm_campaign=day${day}`
        };

        switch(day) {
            case 1: // O Problema: "Governo/Bancos são lentos" -> A Solução: "PIX em 30s"
                payload.title = "⚡ SAQUE INSTANTÂNEO LIBERADO";
                payload.body = `Olá ${user.name || 'Jogador'}, por que esperar o banco? Na BET SOCIAL o PIX cai em 30s. Use o código ${config.bonus} e ganhe 200% agora!`;
                break;

            case 2: // O Problema: "Insegurança" -> A Solução: "Blindagem Maicon Sanches"
                payload.title = "🛡️ AMBIENTE 100% BLINDADO";
                payload.body = "Segurança de nível militar (AES-256). Seu capital está protegido sob a gestão Maicon Sanches. Jogue com os grandes.";
                break;

            case 3: // O Problema: "Perda de Oportunidade" -> A Solução: "Lucro Imediato"
                payload.title = "🚨 ÚLTIMA CHAMADA: CONTA VIP";
                payload.body = `Sua chance de ouro expira em ${config.expires}. Deposite R$ 20 e jogue com R$ 60. O sistema desativará seu bônus em breve!`;
                break;
        }

        try {
            // Comando 23: Disparo de Alta Disponibilidade
            const success = await PushNotification.sendToUser(user.id, payload);
            
            if (success) {
                // Registra para análise de ROI (Retorno sobre Investimento)
                await Analytics.trackPushSent(user.id, day, config.bonus);
                console.log(`🚀 [CONVERSÃO] Dia ${day} enviado: Usuário ${user.id} | Bônus: ${config.bonus}`);
            }
        } catch (error) {
            console.error(`❌ [ERRO] Falha ao perseguir lead ${user.id}:`, error.message);
        }
    }

    /**
     * Cálculo de Precisão Temporal
     */
    getDaysDifference(date) {
        const diffInMs = Date.now() - new Date(date).getTime();
        return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    }
}

// Singleton para garantir instância única no servidor (Economia de Memória)
module.exports = new PersuasionEngine();
