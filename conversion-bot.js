/**
 * BET SOCIAL - CRM PERSUASIVO V2.0 "O EXECUTOR"
 * Foco: Conversão de Alta Performance (High-Ticket & Depósitos Rápidos)
 * Proprietário: Maicon Sanches (WhatsApp: 5524981532122 | cyborgzero19@gmail.com)
 * * Estratégia: Perseguir sem incomodar, resolvendo a "dor" da dúvida.
 */

const CRM_CONFIG = {
    whatsapp_origem: "5524981532122",
    email_suporte: "cyborgzero19@gmail.com",
    retry_policy: {
        max_tentativas: 5,
        backoff_factor: 1.5 // Aumenta o intervalo entre mensagens para não ser "chato"
    },
    triggers: {
        ABANDONO_CHECKOUT: "CLICKED_DEPOSIT",
        SALDO_BAIXO: "LOW_BALANCE",
        INATIVIDADE: "USER_IDLE"
    }
};

class BetSocialPro {
    constructor() {
        this.engine = "Cyborg-Alpha-2026";
    }

    /**
     * Rastreia o abandono e calcula a "Temperatura do Lead"
     */
    async trackBehavior(user) {
        const { id, lastAction, metadata } = user;

        if (lastAction === CRM_CONFIG.triggers.ABANDONO_CHECKOUT) {
            console.log(`[ALERTA] Lead ${id} travou no depósito. Iniciando Recuperação...`);
            return this.initiateSmartFollowUp(user);
        }
    }

    /**
     * Script Dinâmico: Resolve o problema do cliente antes de pedir o dinheiro.
     */
    getPersuasiveContent(step, userName = "Campeão") {
        const library = {
            1: {
                title: "Oportunidade de Ouro",
                msg: `Fala ${userName}, o Maicon aqui. Vi que você quase dobrou sua banca agora. O limite não é mais problema: liberamos 200% de bônus pra você começar no topo. Vamos nessa?`,
                delay: 600000 // 10 min
            },
            2: {
                title: "Acesso Liberado",
                msg: `Ainda processando sua entrada? Já limpei o caminho burocrático. Sua conta está pré-aprovada para buscar os 10 milhões. O lucro não espera, clica aqui.`,
                delay: 3600000 // 1 hora
            },
            3: {
                title: "Aposta Sem Risco",
                msg: `Não quero que você perca essa tendência. O Maicon liberou uma ODD 2.0 EXCLUSIVA só para o seu primeiro aporte. É a chance real de forrar hoje.`,
                delay: 21600000 // 6 horas
            },
            4: {
                title: "Último Chamado",
                msg: `O suporte (cyborgzero19@gmail.com) me avisou que seu bônus expira em 1 hora. Não deixa o dinheiro ficar na mesa.`,
                delay: 86400000 // 24 horas
            }
        };
        return library[step] || null;
    }

    /**
     * Disparo Multicanal (WhatsApp + Email) com Lógica Anti-Spam
     */
    async initiateSmartFollowUp(user) {
        for (let i = 1; i <= CRM_CONFIG.retry_policy.max_tentativas; i++) {
            if (await this.checkIfDeposited(user.id)) break;

            const content = this.getPersuasiveContent(i, user.name);
            if (!content) break;

            // Simula o tempo de espera humano
            await this.sleep(content.delay);

            // Disparo Híbrido: Credibilidade do Maicon Sanches
            await this.dispatchToChannels(user, content);
        }
    }

    async dispatchToChannels(user, content) {
        // Envio via WhatsApp (Sua API)
        const waStatus = await NotificationHub.sendWhatsApp(
            user.phone, 
            content.msg, 
            CRM_CONFIG.whatsapp_origem
        );

        // Backup via Email Profissional
        const emailStatus = await NotificationHub.sendEmail(
            user.email,
            content.title,
            content.msg,
            CRM_CONFIG.email_suporte
        );

        console.log(`[CRM] Persuindo ${user.id} | Passo ${i} | Status: OK`);
    }

    async checkIfDeposited(userId) {
        // Integração real com o Banco de Dados da Bet
        return await DB.query(`SELECT deposited FROM users WHERE id = ${userId}`);
    }

    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

export default new BetSocialPro();
