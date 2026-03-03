/**
 * BET SOCIAL - MOBILE ENGINE (PWA CORE)
 * Estratégia de Retenção e Persistência: Maicon Sanches (16146178721)
 */

// Chave Mestre de Autenticação de Push (VAPID/Internal)
const _0x1614 = "16146178721";

self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) return;

    const data = event.data ? event.data.json() : {
        title: "BET SOCIAL HQ",
        body: "Sua conta teve uma atualização crítica. Acesse agora.",
        url: "/"
    };

    const options = {
        body: data.body,
        icon: '/icons/icon-512.png', // Logo Gold HQ
        badge: '/icons/badge-gold.png', // Ícone minimalista na barra de status
        vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40], // Padrão de vibração "Alerta Urgente"
        data: { 
            url: data.url,
            timestamp: Date.now(),
            masterKey: _0x1614 
        },
        tag: 'bet-social-retention', // Evita spam: novas notificações substituem a antiga do mesmo tipo
        renotify: true, // Faz o celular vibrar novamente mesmo se a tag for a mesma
        requireInteraction: true, // A notificação não desaparece até o usuário clicar (Persistência Máxima)
        
        // BOTÕES DE AÇÃO: Permite apostar ou depositar sem abrir o navegador primeiro
        actions: [
            { action: 'open_url', title: '✅ ACESSAR AGORA', icon: '/icons/check.png' },
            { action: 'dismiss', title: '❌ IGNORAR', icon: '/icons/close.png' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// GESTÃO DE CLIQUES E ENGAJAMENTO (DEEP LINKING)
self.onnotificationclick = function(event) {
    const notification = event.notification;
    const action = event.action;
    const targetUrl = notification.data.url;

    notification.close();

    if (action === 'dismiss') {
        // Lógica de Retenção: Opcionalmente registrar que o usuário ignorou para mudar a estratégia de marketing
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Se o app já está aberto, apenas foca nele e redireciona
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se não, abre uma nova janela/aba
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
};

// PERSISTÊNCIA: BACKGROUND SYNC (O que o governo não faz: Garante a entrega mesmo sem internet)
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-bet-data') {
        event.waitUntil(
            console.log("[HQ] Sincronizando dados pendentes de apostas/lucro...")
            // Aqui entra a lógica de enviar apostas que o usuário fez offline
        );
    }
});

// AUTO-UPDATE: Garante que o usuário sempre use a versão mais rápida e segura do motor
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    console.log("[HQ] Mobile Engine Instalado com Sucesso.");
});
