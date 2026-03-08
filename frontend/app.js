const API_URL = '';

function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const title = document.getElementById('form-title');

    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        title.innerText = 'Вход';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        title.innerText = 'Регистрация';
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!username || !password) {
        message.innerText = 'Заполните все поля';
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('is_admin', data.is_admin);
            localStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        } else {
            message.innerText = data.detail || 'Ошибка входа';
        }
    } catch (err) {
        message.innerText = 'Ошибка подключения к серверу';
    }
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const message = document.getElementById('message');

    if (!username || !password) {
        message.innerText = 'Заполните все поля';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            message.classList.remove('text-red-500');
            message.classList.add('text-green-500');
            message.innerText = 'Регистрация успешна! Теперь вы можете войти.';
            toggleForm();
        } else {
            message.innerText = data.detail || 'Ошибка регистрации';
        }
    } catch (err) {
        message.innerText = 'Ошибка подключения к серверу';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Dashboard Functions
async function initDashboard() {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const username = localStorage.getItem('username');
    document.getElementById('welcome-user').innerText = `Привет, ${username}`;

    if (isAdmin) {
        document.getElementById('admin-panel').classList.remove('hidden');
    }

    await loadServers();
    await loadProfiles();
}

async function loadServers() {
    const serverList = document.getElementById('server-list');
    const serverStats = document.getElementById('server-stats');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    try {
        const response = await fetch(`${API_URL}/servers`);
        const servers = await response.json();

        serverList.innerHTML = '';
        if (isAdmin) serverStats.innerHTML = '';

        servers.forEach(server => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded shadow-sm border-l-4 border-blue-500';
            card.innerHTML = `
                <h4 class="font-bold">${server.location} (${server.name})</h4>
                <p class="text-sm text-gray-600">IP: ${server.ip_address}</p>
                <button onclick="createProfile(${server.id})" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded">Подключиться</button>
            `;
            serverList.appendChild(card);

            if (isAdmin) {
                const statCard = document.createElement('div');
                statCard.className = 'p-3 border rounded text-sm';
                statCard.innerHTML = `
                    <div class="flex justify-between font-bold"><span>${server.name}</span> <span class="${server.status === 'online' ? 'text-green-500' : 'text-red-500'}">${server.status}</span></div>
                    <div>CPU: ${server.cpu_usage}% | RAM: ${server.ram_usage}%</div>
                    <div>Активные: ${server.active_connections}</div>
                    <div class="text-xs text-gray-400">Токен агента: <code class="bg-gray-100 p-1">${server.agent_token}</code></div>
                `;
                serverStats.appendChild(statCard);
            }
        });
    } catch (err) {
        console.error('Failed to load servers', err);
    }
}

async function addServer() {
    const name = document.getElementById('srv-name').value;
    const location = document.getElementById('srv-location').value;
    const ip_address = document.getElementById('srv-ip').value;
    const public_key = document.getElementById('srv-pubkey').value;

    const response = await fetch(`${API_URL}/servers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, location, ip_address, public_key })
    });

    if (response.ok) {
        alert('Сервер добавлен!');
        loadServers();
    } else {
        alert('Ошибка при добавлении сервера');
    }
}

async function loadProfiles() {
    const profileList = document.getElementById('profile-list');

    try {
        const response = await fetch(`${API_URL}/vpn/profiles`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const profiles = await response.json();

        profileList.innerHTML = '';
        if (profiles.length === 0) {
            profileList.innerHTML = '<p class="text-gray-500 italic">У вас еще нет активных профилей. Выберите локацию слева.</p>';
        }

        profiles.forEach(profile => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded shadow-sm flex justify-between items-center';
            card.innerHTML = `
                <div>
                    <h4 class="font-bold">${profile.location}</h4>
                    <p class="text-sm text-gray-600">Внутренний IP: ${profile.internal_ip}</p>
                    <p class="text-xs text-gray-400">Создан: ${new Date(profile.created_at).toLocaleString()}</p>
                </div>
                <button onclick="downloadConfig(${profile.id})" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm">Скачать .conf</button>
            `;
            profileList.appendChild(card);
        });
    } catch (err) {
        console.error('Failed to load profiles', err);
    }
}

async function createProfile(serverId) {
    const response = await fetch(`${API_URL}/vpn/profiles?server_id=${serverId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.ok) {
        loadProfiles();
    } else {
        alert('Ошибка при создании профиля');
    }
}

async function downloadConfig(profileId) {
    const response = await fetch(`${API_URL}/vpn/profiles/${profileId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();
    if (response.ok) {
        const blob = new Blob([data.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
