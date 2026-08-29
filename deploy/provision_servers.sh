#!/bin/bash

# Скрипт для массового развертывания (пример)
# Предполагает наличие SSH доступа по ключам к серверам в списке

API_URL="http://your-central-api.com"
SERVERS=("1.2.3.4" "5.6.7.8" "9.10.11.12")

for IP in "${SERVERS[@]}"; do
    echo "Развертывание на $IP..."

    # В реальности здесь может быть вызов API для создания сервера и получения токена
    # TOKEN=$(curl -X POST $API_URL/servers ...)

    scp deploy/install_server.sh root@$IP:/tmp/
    ssh root@$IP "bash /tmp/install_server.sh $API_URL \"some-unique-token-$IP\" $IP"
done
