#!/bin/bash

# Скрипт для установки WireGuard и Node Agent на Ubuntu 22.04+
set -e

API_URL=$1
AGENT_TOKEN=$2
SERVER_IP=$3

if [ -z "$API_URL" ] || [ -z "$AGENT_TOKEN" ]; then
    echo "Использование: sudo ./install_server.sh <API_URL> <AGENT_TOKEN> [SERVER_IP]"
    exit 1
fi

echo "--- Обновление системы и установка зависимостей ---"
apt-get update
apt-get install -y wireguard curl docker.io python3-pip

echo "--- Генерация ключей WireGuard для сервера ---"
WG_PRIV_KEY=$(wg genkey)
WG_PUB_KEY=$(wg pubkey <<< "$WG_PRIV_KEY")

echo "--- Настройка WireGuard интерфейса (wg0) ---"
cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
PrivateKey = $WG_PRIV_KEY
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

echo "--- Настройка Node Agent в Docker ---"
docker run -d \
  --name vpn-agent \
  --cap-add=NET_ADMIN \
  --network host \
  --restart always \
  -e API_URL=$API_URL \
  -e AGENT_TOKEN=$AGENT_TOKEN \
  -v /etc/wireguard:/etc/wireguard \
  python:3.12-slim \
  bash -c "apt-get update && apt-get install -y wireguard-tools iproute2 && pip install requests psutil && curl -sSL https://raw.githubusercontent.com/your-repo/master/node-agent/agent.py -o agent.py && python agent.py"

echo "--- Готово! ---"
echo "Public Key сервера: $WG_PUB_KEY"
echo "Не забудьте добавить этот сервер в панель управления, используя этот Public Key и токен."
