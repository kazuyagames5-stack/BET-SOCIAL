/**
 * BET SOCIAL - ECHELON TRACKING SYSTEM (ETS)
 * Arquiteto: Maicon Sanches | Auth: 16146178721
 * Foco: Maximizar ROI e Capturar "Baleias" (High Rollers)
 */

const PixelMaster = (() => {
    // Memória de contingência para evitar perda de eventos em conexões instáveis
    const eventQueue = [];

    const _log = (msg, type = 'info') => {
        const icons = { info: '📡', success: '💰', alert: '⚠️' };
        console.log(`%c[BET SOCIAL HQ] ${icons[type]} ${msg}`, "color: #f3ba2f; font-weight: bold;");
    };

    // Processa a fila de eventos caso os SDKs demorem a carregar
    const flushQueue = () => {
        while(eventQueue.length > 0 && (window.fbq || window.gtag || window.ttq)) {
            const evt = eventQueue.shift();
            evt();
        }
    };

    return {
        /**
         * Rastreamento de Registro com Atribuição de Origem
         */
        trackRegistration: (platform) => {
            _log(`Iniciando Registro: ${platform.toUpperCase()}`);

            const execute = () => {
                // Facebook: Otimização para conversão personalizada
                if(typeof fbq !== 'undefined') fbq('track', 'CompleteRegistration', { content_name: platform });
                
                // Google: Sinal de Lead Qualificado
                if(typeof gtag !== 'undefined') gtag('event', 'sign_up', { method: platform });
                
                // TikTok: Gatilho de Audiência Viral
                if(typeof ttq !== 'undefined') ttq.track('CompleteRegistration');
                
                // Pinterest/Kwai/Outros podem ser injetados aqui
            };

            if (!window.fbq && !window.gtag) {
                eventQueue.push(execute);
            } else {
                execute();
            }
        },

        /**
         * O EVENTO MESTRE: DEPÓSITO (PURCHASE)
         * Otimizado para identificar LTV (Lifetime Value) alto.
         */
        trackDeposit: (value, currency = 'BRL', orderId = `BS-${Date.now()}`) => {
            const val = parseFloat(value);
            _log(`DEPOSITO DETECTADO: ${currency} ${val.toFixed(2)}`, 'success');

            const execute = () => {
                // 1. FACEBOOK - Algoritmo de Busca de Baleias
                if(typeof fbq !== 'undefined') {
                    fbq('track', 'Purchase', { 
                        value: val, 
                        currency: currency,
                        content_type: 'product',
                        content_ids: ['DEPOSIT_FUNDS'],
                        num_items: 1,
                        transaction_id: orderId // Evita duplicidade de evento
                    });
                }

                // 2. GOOGLE ADS - Otimização de ROI (ROAS)
                if(typeof gtag !== 'undefined') {
                    gtag('event', 'purchase', {
                        transaction_id: orderId,
                        value: val,
                        currency: currency,
                        items: [{ item_id: "DEP_01", item_name: "Deposit" }]
                    });
                }

                // 3. TIKTOK ADS - Escala de Campanha de Performance
                if(typeof ttq !== 'undefined') {
                    ttq.track('CompletePayment', {
                        content_id: '1',
                        content_type: 'product',
                        content_name: 'deposit',
                        quantity: 1,
                        price: val,
                        value: val,
                        currency: currency,
                    });
                }
            };

            // Tenta executar ou joga na fila se os scripts externos ainda não baixaram
            if (!window.fbq && !window.gtag && !window.ttq) {
                _log("Aguardando inicialização dos scripts de terceiros...", "alert");
                eventQueue.push(execute);
                // Tenta reprocessar a cada 2 segundos
                const retry = setInterval(() => {
                    if(window.fbq || window.gtag) {
                        flushQueue();
                        clearInterval(retry);
                    }
                }, 2000);
            } else {
                execute();
            }
        }
    };
})();

// Auto-inicialização de limpeza de fila
window.addEventListener('load', () => {
    setTimeout(() => { if(typeof PixelMaster !== 'undefined') PixelMaster.trackRegistration('System_Auto_Load'); }, 1000);
});
