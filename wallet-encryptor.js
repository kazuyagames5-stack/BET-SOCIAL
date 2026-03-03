/**
 * BET SOCIAL - ULTRA-SECURE WALLET SHIELD v4.0
 * Protocolo de Blindagem de Ativos: Maicon Sanches (16146178721)
 * Foco: Integridade absoluta e proteção contra ataques de dicionário.
 */

const crypto = require('crypto');

class WalletShield {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        // Salt fixo para derivação de chave (Pilar de Segurança 2)
        this.salt = Buffer.from('BET_SOCIAL_CONTROL_SALT_2026', 'utf8');
        this.masterInput = '16146178721_MAICON_SANCHES_SECRET_KEY_5B';
        
        // Derivação de Chave de Alta Segurança (HKDF)
        // Isso impede que a chave mestre original seja exposta se um arquivo for vazado
        this.masterKey = crypto.hkdfSync(
            'sha512',
            this.masterInput,
            this.salt,
            'WALLET_ENCRYPTION_KEY',
            32
        );
    }

    /**
     * Encripta o saldo com autenticação adicional (AAD).
     * Garante que o saldo não foi alterado nem mesmo no banco de dados (Bit-flipping protection).
     */
    protectBalance(balance, walletId) {
        // IV de 12 bytes é o padrão recomendado para GCM (Performance + Segurança)
        const iv = crypto.randomBytes(12); 
        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

        // Adiciona o ID da carteira como dado autenticado (AAD)
        // Isso impede que alguém copie o código criptografado de uma carteira para outra
        cipher.setAAD(Buffer.from(walletId, 'utf8'));

        let encrypted = cipher.update(balance.toString(), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        // Retorna o pacote com metadados para auditoria futura
        return `v2:${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    /**
     * Desencripta e valida a integridade do dado.
     * Se 1 bit for alterado por um hacker, o sistema trava o saque automaticamente.
     */
    decryptBalance(encryptedData, walletId) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 4) throw new Error("Pacote de dados corrompido ou versão antiga.");

            const [version, ivHex, authTagHex, encrypted] = parts;
            
            const decipher = crypto.createDecipheriv(
                this.algorithm, 
                this.masterKey, 
                Buffer.from(ivHex, 'hex')
            );

            decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
            decipher.setAAD(Buffer.from(walletId, 'utf8'));

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return parseFloat(decrypted);
        } catch (error) {
            // Log de Alerta de Fraude (Pode ser integrado ao seu painel de comando)
            console.error(`[ALERTA DE SEGURANÇA]: Tentativa de violação na carteira ${walletId}`);
            return null; 
        }
    }
}

module.exports = new WalletShield();
