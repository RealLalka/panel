document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:4444/api';

    const siteApp = {
        socket: null,
        getUserData: () => JSON.parse(localStorage.getItem('userData')),
        getToken: () => localStorage.getItem('userToken'),
        getCurrentPage: () => {
            const path = window.location.pathname;
            return path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
        },

        checkAuth: () => {
            const userData = siteApp.getUserData();
            const token = siteApp.getToken();
            const currentPage = siteApp.getCurrentPage();

            if (currentPage !== 'auth' && (!token || !userData)) {
                window.location.href = '/auth.html';
                return;
            }

            if (currentPage === 'auth' && token && userData) {
                window.location.href = '/pages/hello.html';
                return;
            }

            if (userData && userData.permissions) {
                if (currentPage !== 'hello' && !userData.permissions.includes(currentPage)) {
                    document.body.innerHTML = `
                        <div style="text-align: center; padding: 50px; font-family: sans-serif;">
                            <h1>Доступ запрещен</h1>
                            <p>У вас больше нет прав для просмотра этой страницы. Вы будете перенаправлены.</p>
                            <a href="/pages/hello.html" style="text-decoration: none; color: #007bff;">На главную</a>
                        </div>`;
                    setTimeout(() => {
                        window.location.href = '/pages/hello.html';
                    }, 3000);
                    throw new Error('Access Denied');
                }
            }
        },

        updateHeader: () => {
            const userData = siteApp.getUserData();
            if (!userData) return;

            const profileNameEl = document.querySelector('.profile-name');
            const profileIdEl = document.querySelector('.profile-id');
            const logoutButton = document.getElementById('open-logout-modal');

            if (profileNameEl) profileNameEl.textContent = userData.username || userData.email;
            if (profileIdEl) profileIdEl.textContent = `ID: ${userData.id}`;

            if (logoutButton) {
                const confirmLogoutBtn = document.getElementById('confirm-logout-button');
                confirmLogoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('userData');
                    localStorage.removeItem('userToken');
                    if (siteApp.socket) {
                        siteApp.socket.disconnect();
                    }
                    window.location.href = '/auth.html';
                });
            }
        },

        updateNavigation: () => {
            const userData = siteApp.getUserData();
            const permissions = (userData && Array.isArray(userData.permissions)) ? userData.permissions : [];
            const navItems = document.querySelectorAll('.nav-item');

            navItems.forEach(item => {
                const link = item.querySelector('a.nav-link');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href) {
                        const pageNameMatch = href.match(/([^\/]+)\.html$/);
                        const page = pageNameMatch ? pageNameMatch[1] : null;

                        if (page && permissions.includes(page)) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                }
            });
        },

        initSocket: () => {
            const userData = siteApp.getUserData();
            if (userData && userData.id && !siteApp.socket) {
                siteApp.socket = io('http://localhost:4444');

                siteApp.socket.on('connect', () => {
                    console.log('Connected to WebSocket server!');
                    siteApp.socket.emit('register', userData.id);
                });

                siteApp.socket.on('permissions_updated', (data) => {
                    console.log('Права обновлены администратором!', data);
                    const currentUserData = siteApp.getUserData();

                    if (currentUserData) {
                        currentUserData.permissions = data.permissions;
                        localStorage.setItem('userData', JSON.stringify(currentUserData));

                        alert('Ваши права доступа были изменены. Страница будет перезагружена.');
                        window.location.reload();
                    }
                });

                siteApp.socket.on('disconnect', () => {
                    console.log('Disconnected from WebSocket server.');
                });
            }
        },

        renderDeals: async () => { },
        renderDisputes: async () => { },
        renderRequisites: async () => { },
        renderDevices: async () => { },
        renderMessages: async () => { },
        renderPayments: async () => { },


        init: () => {
            try {
                const currentPage = siteApp.getCurrentPage();

                if (currentPage !== 'auth') {
                    siteApp.checkAuth();
                    siteApp.updateHeader();
                    siteApp.updateNavigation();
                    siteApp.initSocket();
                }

                switch (currentPage) {
                    case 'deals': siteApp.renderDeals(); break;
                    case 'disputes': siteApp.renderDisputes(); break;
                    case 'requisites': siteApp.renderRequisites(); break;
                    case 'devices': siteApp.renderDevices(); break;
                    case 'messages': siteApp.renderMessages(); break;
                    case 'payments': siteApp.renderPayments(); break;
                }
            } catch (error) {
                console.error("Произошла ошибка при инициализации:", error.message);
            }
        }
    };
    const toggleButton = document.getElementById('currency-toggle');
    if (toggleButton) {
        const rubSpan = toggleButton.querySelector('.legend-rub');
        const usdtSpan = toggleButton.querySelector('.legend-usdt');

        toggleButton.addEventListener('click', () => {
            rubSpan.classList.toggle('active');
            usdtSpan.classList.toggle('active');
        });
    }

    function initializeTabs(tabsContainer) {
        tabsContainer.addEventListener('click', (event) => {
            const clickedTab = event.target.closest('.filter-tab');
            if (!clickedTab) {
                return;
            }
            const currentActiveTab = tabsContainer.querySelector('.filter-tab.active');
            if (currentActiveTab && currentActiveTab !== clickedTab) {
                currentActiveTab.classList.remove('active');
            }
            clickedTab.classList.add('active');
        });
    }

    const allTabsContainers = document.querySelectorAll('.filter-tabs');
    allTabsContainers.forEach(container => {
        initializeTabs(container);
    });

    siteApp.init();
});
