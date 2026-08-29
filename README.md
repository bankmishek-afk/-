# VPN Service Platform

Готовая к развертыванию платформа для предоставления услуг VPN на базе WireGuard.

## Структура проекта

- `backend/`: API на FastAPI (Python). Обрабатывает пользователей, серверы и генерацию конфигов.
- `frontend/`: Простой веб-интерфейс (Dashboard) на HTML/JS + Tailwind CSS.
- `node-agent/`: Агент, устанавливаемый на VPN-узлы для синхронизации настроек WireGuard.
- `docker/`: Docker-конфигурации для быстрого развертывания центрального сервера.
- `deploy/`: Скрипты автоматизации установки узлов.

## Быстрый старт (Центральный сервер)

1. Установите Docker и Docker Compose.
2. Перейдите в директорию `docker/`.
3. Запустите систему:
   ```bash
   docker-compose up -d
   ```
4. Панель управления будет доступна по адресу `http://localhost`. API — `http://localhost:8000`.

## Добавление нового VPN узла

1. Арендуйте Linux сервер (Ubuntu 22.04+).
2. Скопируйте скрипт `deploy/install_server.sh` на сервер.
3. Запустите его:
   ```bash
   sudo ./install_server.sh <URL_ВАШЕГО_API> <УНИКАЛЬНЫЙ_ТОКЕН_АГЕНТА>
   ```
4. Скрипт установит WireGuard, Docker и запустит агента.
5. Зарегистрируйте сервер в админ-панели, используя выданный Public Key.

## Технологии

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT.
- **VPN**: WireGuard.
- **Frontend**: Tailwind CSS, Vanilla JS.
- **Monitoring**: CPU/RAM/Connections reporting.

## Пример конфигурации WireGuard (Клиент)

```ini
[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = 10.0.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = <SERVER_IP>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 20
```

## Безопасность

- JWT аутентификация.
- Хеширование паролей BCrypt.
- Изоляция клиентов внутри сети WireGuard.
- Автоматическая очистка неактивных сессий.
