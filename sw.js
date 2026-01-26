/**
 * Service Worker
 * 提供离线支持和推送通知
 */

const CACHE_NAME = 'convict-fitness-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/utils.js',
    './js/db.js',
    './js/exercises.js',
    './js/progression.js',
    './js/notification.js',
    './js/email-backup.js',
    './js/app.js',
    './manifest.json'
];

// 安装事件
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Install complete');
                return self.skipWaiting();
            })
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activate complete');
                return self.clients.claim();
            })
    );
});

// 请求拦截
self.addEventListener('fetch', (event) => {
    // 只处理GET请求
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // 返回缓存，同时在后台更新
                    event.waitUntil(
                        fetch(event.request)
                            .then((response) => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => cache.put(event.request, response));
                                }
                            })
                            .catch(() => {})
                    );
                    return cachedResponse;
                }
                
                // 没有缓存，尝试网络请求
                return fetch(event.request)
                    .then((response) => {
                        if (!response.ok) {
                            return response;
                        }
                        
                        // 缓存新资源
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // 离线且无缓存
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// 接收推送通知
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');
    
    let data = {
        title: '囚徒健身',
        body: '该运动了！',
        icon: './icons/icon-192.png'
    };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
        event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || './icons/icon-192.png',
            badge: './icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'fitness-reminder',
            renotify: true,
            actions: [
                { action: 'open', title: '开始训练' },
                { action: 'later', title: '稍后提醒' }
            ]
        })
    );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'later') {
        // 30分钟后再次提醒
        setTimeout(() => {
            self.registration.showNotification('💪 别忘了训练！', {
                body: '30分钟前你说稍后提醒~',
                icon: './icons/icon-192.png'
            });
        }, 30 * 60 * 1000);
        return;
    }
    
    // 打开应用
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // 如果已有窗口，聚焦它
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // 否则打开新窗口
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// 接收来自主线程的消息
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(event.data.title, event.data.options);
    }
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 后台同步（如果支持）
self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);
    
    if (event.tag === 'sync-logs') {
        event.waitUntil(
            // 这里可以添加数据同步逻辑
            Promise.resolve()
        );
    }
});

// 定期后台同步（如果支持）
self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'daily-reminder') {
        event.waitUntil(
            self.registration.showNotification('💪 每日训练提醒', {
                body: '今天的训练完成了吗？',
                icon: './icons/icon-192.png'
            })
        );
    }
});
