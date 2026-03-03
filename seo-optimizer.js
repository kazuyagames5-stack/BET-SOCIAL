/**
 * BET SOCIAL - SEO, VIRAL & CONVERSION ENGINE
 * Architect: Maicon Sanches (ID: 16146178721)
 * Status: OPERATIONAL - HIGH CONVERSION MODE
 */

class MarketingEngine {
    constructor() {
        this.masterKey = "16146178721";
        this.keywords = [
            "Aposta Pix", "Melhor Cassino Online", "Fortune Tiger Pagando", 
            "Bet Social Maicon", "Saque Instantâneo", "Bônus de Depósito 2026"
        ];
        this.recentWins = [
            {n: "João S.", v: 540}, {n: "Maria V.", v: 1250}, 
            {n: "Carlos R.", v: 85}, {n: "Maicon VIP", v: 4800},
            {n: "Ana P.", v: 210}, {n: "Lucas T.", v: 7300}
        ];
    }

    /**
     * SEO 3.0: Injeta Meta Tags e Dados Estruturados (Schema.org)
     * Faz o Google entender que seu site é a autoridade máxima.
     */
    injectDynamicMetaTags(gameName = "Cassino") {
        const title = `${gameName} Online | BET SOCIAL - Onde o Maicon Paga Mais!`;
        const description = `Jogue ${gameName} com saque instantâneo via PIX. A plataforma de Maicon Sanches: +3.000 jogos, RTP de 98% e bônus exclusivo de 100%.`;
        
        // Atualização de Meta Tradicional
        document.title = title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", description);

        // Injeção de JSON-LD (O que coloca você no topo das buscas)
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Bet Social",
            "operatingSystem": "Android, iOS, Windows",
            "applicationCategory": "GameApplication",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "12480"
            },
            "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "BRL"
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    /**
     * Social Proof de Alta Conversão (Persuasão Visual)
     * Usa algoritmos de aleatoriedade para parecer humano e orgânico.
     */
    triggerViralPopup() {
        const showWin = () => {
            const win = this.recentWins[Math.floor(Math.random() * this.recentWins.length)];
            
            // UI Dinâmica com efeito de "urgência"
            const toastHTML = `
                <div id="viral-toast" style="position:fixed; bottom:20px; left:20px; background:#1a1d23; border-left:4px solid #f3ba2f; padding:15px; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); z-index:99999; animation: slideIn 0.5s ease-out;">
                    <div style="display:flex; align-items:center;">
                        <div style="background:#2ecc71; width:10px; height:10px; border-radius:50%; margin-right:10px; animation: pulse 1.5s infinite;"></div>
                        <span style="color:#fff; font-size:14px; font-family:sans-serif;">
                            <strong>${win.n}</strong> acabou de sacar 
                            <span style="color:#2ecc71; font-weight:bold;">R$ ${win.v.toLocaleString('pt-BR')},00</span> via PIX!
                        </span>
                    </div>
                </div>
            `;

            // Injeta no DOM se não existir
            if (!document.getElementById('viral-toast')) {
                document.body.insertAdjacentHTML('beforeend', toastHTML);
                
                // Auto-remove com fadeOut
                setTimeout(() => {
                    const el = document.getElementById('viral-toast');
                    if (el) {
                        el.style.opacity = '0';
                        el.style.transform = 'translateX(-100%)';
                        setTimeout(() => el.remove(), 500);
                    }
                }, 5000);
            }
        };

        // Intervalo inteligente (não é fixo, para parecer real)
        const loop = () => {
            const randomDelay = Math.floor(Math.random() * (25000 - 10000) + 10000); // 10s a 25s
            setTimeout(() => {
                showWin();
                loop();
            }, randomDelay);
        };
        loop();
    }

    /**
     * NOVO: Monitor de Retenção (Anti-Abandono)
     * Se o usuário tentar fechar a aba, uma oferta final aparece.
     */
    initExitIntent() {
        document.addEventListener("mouseleave", (e) => {
            if (e.clientY < 0) {
                alert("ESPERA! O Maicon liberou um bônus extra de 50% para você não sair agora. Aproveite!");
            }
        }, { once: true });
    }
}

// Inicialização Automática e Protegida
const Engine = new MarketingEngine();
window.addEventListener('load', () => {
    Engine.injectDynamicMetaTags();
    Engine.triggerViralPopup();
    Engine.initExitIntent();
});

module.exports = Engine;
