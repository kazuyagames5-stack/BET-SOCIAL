/**
 * BET SOCIAL - FIREWALL DE NÚCLEO V2.0 (MODO ELITE)
 * Proteção de Ativos: Maicon Sanches (16146178721)
 * Protocolo: AES-256-GCM (Criptografia Autenticada) & Anti-Tampering
 */

const crypto = require('crypto');

class SecurityShield {
    constructor() {
        this.maxRequestsPerMinute = 500; // Escalado para alta disponibilidade
        // Salt fixo para o Master Hash (Pilar de Segurança 16146178721)
        this.masterSalt = "BET_SOCIAL_CORE_SYSTEM_2026";
        this.secretKey = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'FALLBACK_KEY', 'salt', 32);
        this.masterHash = this._generateMasterHash("16146178721");
    }

    // 1. Sanitização Profunda (Recursiva para Objetos e Arrays)
    // Se o governo falha na validação, nós limpamos cada bit de entrada.
    sanitize(input) {
        if (Array.isArray(input)) return input.map(item => this.sanitize(item));
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            for (let key in input) sanitized[key] = this.sanitize(input[key]);
            return sanitized;
        }
        if (typeof input !== 'string') return input;
        
        // Remove scripts, injeções SQL e caracteres de escape de shell
        return input
            .replace(/[<>'"%;()&+]/g, "")
            .replace(/DROP|SELECT|INSERT|DELETE|UPDATE|UNION|script/gi, "[BLOCKED]");
    }

    // 2. Validação de Sessão Mestre com Proteção contra "Timing Attacks"
    // Compara os hashes em tempo constante para que ninguém descubra a senha por milissegundos.
    validateAdminSession(inputPass) {
        const inputHash = this._generateMasterHash(inputPass);
        
        // crypto.timingSafeEqual impede que hackers meçam o tempo de resposta do processador
        const isValid = crypto.timingSafeEqual(
            Buffer.from(inputHash, 'hex'),
            Buffer.from(this.masterHash, 'hex')
        );

        if (!isValid) {
            this.logSecurityBreach(`TENTATIVA DE INVASÃO DETECTADA: Senha incorreta fornecida.`);
            return false;
        }
        return true;
    }

    // 3. Criptografia de Dados Financeiros (Padrão AEAD - AES-256-GCM)
    // Diferente do V1.0, o GCM garante que os dados não foram alterados (Integridade).
    encryptSensitiveData(text) {
        const iv = crypto.randomBytes(12); // Vetor de Inicialização único por transação
        const cipher = crypto.createCipheriv('aes-256-gcm', this.secretKey, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        // Retorna o IV + Tag de Autenticação + Dados Criptografados
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    // 4. Descriptografia Autenticada (Verifica se o dado é legítimo)
    decryptSensitiveData(encryptedData) {
        const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm', 
            this.secretKey, 
            Buffer.from(ivHex, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    // Gerador Interno de Hash Seguro
    _generateMasterHash(password) {
        return crypto.createHmac('sha512', this.masterSalt)
                     .update(password)
                     .digest('hex');
    }

    logSecurityBreach(message) {
        // Envio para os canais de comando salvos (cyborgzero19@gmail.com / +5524981532122)
        const timestamp = new Date().toISOString();
        console.error(`\x1b[41m\x1b[37m [ALERTA DE SEGURANÇA MESTRE] \x1b[0m`);
        console.error(`STATUS: BRECHA BLOQUEADA`);
        console.error(`HORA: ${timestamp}`);
        console.error(`DETALHES: ${message}`);
        // Aqui você integraria a chamada de API para seu WhatsApp ou Telegram
    }
}

module.exports = new SecurityShield();
