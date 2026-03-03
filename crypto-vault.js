/**
 * BET SOCIAL - CRYPTO GATEWAY PRIVADO ELITE
 * Proprietário: Maicon Santos Sanches
 * Versão: 2.0.0 - Enterprise Resilience
 */

// Configurações com Camada de Redundância e Segurança
const CRYPTO_CONFIG = Object.freeze({
    wallets: {
        BTC: "bc1qk802dfzgw55eg3xf0s5lyyw6s2p8ks3p5aj95l",
        ETH: "0x80bd2AF222615FF4dA92Fc22ab4FC27b2E4CBc31",
        SOL: "D8gvMn3r6BQrnG74afX8UjxePNhwhxe969Qe1eeoGp1S",
        BNB: "0x80bd2AF222615FF4dA92Fc22ab4FC27b2E4CBc31"
    },
    // Parâmetros Dinâmicos de Segurança
    networks: {
        BTC: { min_confirmations: 2, fee_split: 0.015 },
        ETH: { min_confirmations: 12, fee_split: 0.02 }, // Proteção contra Reorgs na Ethereum
        SOL: { min_confirmations: 32, fee_split: 0.01 }, // Finalidade rápida, exige mais slots
        BNB: { min_confirmations: 15, fee_split: 0.02 }
    },
    retry_attempts: 5,
    request_timeout: 10000 // 10 segundos
});

/**
 * Função de Processamento com Validação de Integridade e Idempotência
 */
async function processIncomingCrypto(txHash, network, userId) {
    const startTime = Date.now();
    
    // 1. Validação de Idempotência (Evita crédito duplicado se a função rodar 2x)
    const isProcessed = await database.checkIfTxProcessed(txHash);
    if (isProcessed) {
        return { status: "ALREADY_PROCESSED", code: 409 };
    }

    try {
        // 2. Conexão com Fallback (Se um nó falhar, tenta outro automaticamente)
        const txData = await blockchainConnector.verifyWithRetry(txHash, network, {
            timeout: CRYPTO_CONFIG.request_timeout,
            attempts: CRYPTO_CONFIG.retry_attempts
        });

        const netConfig = CRYPTO_CONFIG.networks[network];

        // 3. Verificação de Segurança Avançada
        if (txData.confirmations >= netConfig.min_confirmations) {
            
            // Validação de Destino (Case-Insensitive para evitar erros de checksum)
            const isValidDestination = txData.destination.toLowerCase() === CRYPTO_CONFIG.wallets[network].toLowerCase();

            if (isValidDestination) {
                
                // 4. Cálculo de Taxa e Liquidez (Business Logic)
                const netAmount = txData.amount * (1 - netConfig.fee_split);
                
                // 5. Atomic Transaction (Garante que o saldo suba E o log grave, ou nada acontece)
                const session = await database.startTransaction();
                try {
                    await updateUserBalance(userId, netAmount, session);
                    await database.markTxAsProcessed(txHash, {
                        userId,
                        amount: txData.amount,
                        netAmount,
                        network,
                        timestamp: new Date()
                    }, session);
                    
                    await session.commit();
                } catch (dbError) {
                    await session.rollback();
                    throw new Error("Database Atomic Failure");
                }

                // 6. Log de Auditoria de Alta Precisão para o Maicon
                const latency = Date.now() - startTime;
                logger.info(`[AUDIT] Maicon, depósito confirmado: ${txData.amount} ${network} | User: ${userId} | Latência: ${latency}ms`);
                
                return { 
                    status: "SUCCESS", 
                    amount_credited: netAmount, 
                    confirmations: txData.confirmations 
                };
            }
        }

        // Se ainda não atingiu as confirmações, retorna o status atual para o Front-end
        return { 
            status: "PENDING_CONFIRMATIONS", 
            current: txData.confirmations, 
            required: netConfig.min_confirmations 
        };

    } catch (error) {
        // 7. Sistema de Alerta Crítico
        logger.error(`CRITICAL_GATEWAY_ERROR: ${error.message} | TX: ${txHash}`);
        return { 
            status: "ERROR", 
            message: "Falha na sincronização Blockchain. Notificação enviada ao suporte.",
            code: 500 
        };
    }
}
