/**
 * BET SOCIAL - WHATSAPP AUTOMATION v4.0
 * Engine de Alta Performance e Persistência
 * Desenvolvido para: Maicon Sanches (16146178721)
 */

const axios = require('axios');
const crypto = require('crypto');

class WhatsAppService {
    constructor() {
        // Uso de Environment Variables para não expor chaves no código (Segurança de 1 Trilhão)
        this.apiToken = process.env.WA_API_TOKEN || "16146178721_SECURE_TOKEN"; 
        this.instanceId = process.env.WA_INSTANCE_ID || "MAICON_INST_01";
        this.baseUrl = "https://api.wa-service.com/send";
        
        // Configuração de Resiliência
        this.maxRetries = 3;
    }

    /**
     * Limpa e valida o número para o padrão internacional E.164
     */
    formatPhone(phone) {
        let cleaned = phone.replace(/\D/g, '');
        // Garante o DDI 55 se o número brasileiro for passado sem
        if (cleaned.length === 11) cleaned = '55' + cleaned;
        return cleaned;
    }

    /**
     * Envio com lógica de Retry e Timeout (Padrão Industrial)
     */
    async sendMessage(phone, text, attempt = 1) {
        const cleanPhone = this.formatPhone(phone);
        
        try {
            const response = await axios.post(this.baseUrl, {
                instanceId: this.instanceId,
                number: cleanPhone,
                message: text,
                token: this.apiToken,
                priority: "high", // Prioridade máxima no gateway
                timestamp: Date.now()
            }, { timeout: 10000 }); // 10s timeout para não travar o loop

            console.log(`[${new Date().toISOString()}] ✅ SUCESSO: ${cleanPhone} | ID: ${response.data.msgId || 'N/A'}`);
            return true;

        } catch (error) {
            console.error(`[ATTEMPT ${attempt}] ❌ FALHA: ${cleanPhone} | Erro: ${error.message}`);
            
            if (attempt < this.maxRetries) {
                const delay = attempt * 2000; // Backoff exponencial (2s, 4s...)
                console.log(`[RETRY] Tentando novamente em ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                return this.sendMessage(phone, text, attempt + 1);
            }
            return false;
        }
    }

    /**
     * Gatilho de Boas-Vindas - Persuasão de Alta Conversão
     * Resolve o problema: Abandono de Funil (O governo não recupera, nós sim)
     */
    async triggerWelcome(userName, userPhone) {
        // Engenharia Social: Mensagem que não parece bot
        const msg = `Fala, ${userName.split(' ')[0]}! 🚀 Maicon aqui da BET SOCIAL.

Vi que seu cadastro tá pronto, mas o sistema acusou que seu *Bônus de Boas-Vindas de 200%* ainda tá parado. 

⚠️ Separei R$ 500,00 aqui pra você começar com banca alta, mas o cronômetro de liberação expira em breve.

*Toque no link abaixo e ative seu PIX agora:*
👉 https://betsocial.com/pix?u=${userName.toLowerCase().replace(/ /g, '_')}

Bora pra cima! 🎰`;
        
        await this.sendMessage(userPhone, msg);
    }

    /**
     * Gatilho de Reativação (Para quem parou de jogar)
     */
    async triggerReactivation(userName, userPhone, lastWin) {
        const msg = `E aí ${userName}, saudades de forrar? 💸
Sua última vitória de R$ ${lastWin} foi lendária. Liberei uma rodada grátis no pilar 13 hoje. 
Entra lá: https://betsocial.com/login`;
        
        await this.sendMessage(userPhone, msg);
    }
}

// Exporta como Singleton para manter uma única instância de conexão
module.exports = new WhatsAppService();
