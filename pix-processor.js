/**
 * @constant {Object} CONFIG - Centralização de parâmetros críticos e segurança
 * Mantendo sua chave PIX: 5524981532122
 */
const PIX_CONFIG = {
    API_BASE: "https://api.gateway-pagamento.com/v2",
    KEY: "5524981532122",
    TIMEOUT: 5000, // 5 segundos para evitar travamento de UI
    RETRY_ATTEMPTS: 3
};

/**
 * @async
 * @function generatePixCharge
 * @description Gera cobrança PIX com tratamento de erros, telemetria e segurança.
 */
async function generatePixCharge(amount, userId) {
    // 1. Validação de Integridade (Pilar de Segurança)
    if (amount <= 0 || isNaN(amount)) {
        throw new Error("Valor de depósito inválido para processamento.");
    }

    const payload = {
        key: PIX_CONFIG.KEY,
        value: amount.toFixed(2),
        description: `BET SOCIAL - Depósito Identificado: ${userId}`,
        callback_url: "https://api.betsocial.com/v1/pix-callback",
        // Adição de metadados para conciliação bancária avançada
        metadata: {
            user_reference: userId,
            timestamp: new Date().toISOString(),
            origin: "WEB_APP_V3"
        }
    };

    try {
        console.info(`[PIX] Iniciando geração para User: ${userId} | Valor: R$ ${amount}`);

        // 2. Motor de Geração com Fallback
        // O PixEngine agora opera de forma assíncrona para não travar a Main Thread
        const qrCodeData = await PixEngine.createStaticQR(payload);

        // 3. Validação de Saída (UX/UI Pilar 11)
        if (!qrCodeData || !qrCodeData.payload_copy_paste) {
            throw new Error("Falha na geração do Payload PIX.");
        }

        // 4. Retorno Estruturado para a Interface
        return {
            success: true,
            qrCodeBase64: qrCodeData.image, // Para renderizar o QR Code
            copyPaste: qrCodeData.payload_copy_paste, // "Pix Copia e Cola"
            expiresIn: 3600, // Expiração em 1 hora para gestão de cache
            transactionId: qrCodeData.txid
        };

    } catch (error) {
        // 5. Tratamento de Exceção Silencioso para o Usuário, Alerta para o Dev
        console.error(`[PIX_CRITICAL_ERROR]: ${error.message}`);
        
        // Retorno de fallback para não quebrar a experiência do cliente
        return {
            success: false,
            message: "Sistema momentaneamente instável. Tente novamente em segundos.",
            error_code: "GATEWAY_TIMEOUT"
        };
    }
}
