#!/bin/bash
# Geometry Dash в терминале
# Enter - прыжок

# Инициализация
WIDTH=40
PLAYER_Y=0
GRAVITY=1
JUMP_FORCE=-3
VELOCITY=0
OBSTACLE_X=$((WIDTH - 5))
OBSTACLE_Y=0
SPEED=0.15
SCORE=0

# Скрываем курсор
tput civis
tput clear

# Обработчик нажатий
jump() {
    VELOCITY=$JUMP_FORCE
}

# Чтение ввода без Enter
setup_input() {
    stty -echo -icanon time 0 min 0
    trap 'stty echo icanon; tput cnorm; exit' INT TERM
}

# Основной игровой цикл
setup_input
while true; do
    # Чтение ввода
    read -r -n1 key
    if [[ "$key" == $'\x0a' ]] || [[ "$key" == "" ]]; then
        jump
    fi
    
    # Физика
    VELOCITY=$((VELOCITY + GRAVITY))
    PLAYER_Y=$((PLAYER_Y + VELOCITY))
    
    # Ограничение по полу
    if (( PLAYER_Y > 0 )); then
        PLAYER_Y=0
        VELOCITY=0
    fi
    
    # Движение препятствия
    OBSTACLE_X=$((OBSTACLE_X - 1))
    if (( OBSTACLE_X < 0 )); then
        OBSTACLE_X=$((WIDTH - 1))
        OBSTACLE_Y=$((RANDOM % 3))
        SCORE=$((SCORE + 1))
    fi
    
    # Проверка столкновения
    if (( OBSTACLE_X == 3 && PLAYER_Y <= OBSTACLE_Y )); then
        tput clear
        echo "💀 ИГРА ОКОНЧЕНА! Счёт: $SCORE"
        echo "Нажмите Enter для выхода"
        read -r
        break
    fi
    
    # Отрисовка
    tput home
    
    # Верхняя граница
    echo "┌────────────────────────────────────────┐"
    
    # Игровое поле
    for ((y=3; y>=0; y--)); do
        echo -n "│"
        for ((x=0; x<WIDTH; x++)); do
            if (( x == 3 && y == PLAYER_Y )); then
                echo -n "🟦"
            elif (( x == OBSTACLE_X && y == OBSTACLE_Y )); then
                echo -n "🧱"
            elif (( y == 0 )); then
                echo -n "═"
            else
                echo -n " "
            fi
        done
        echo "│"
    done
    
    # Нижняя граница
    echo "└────────────────────────────────────────┘"
    echo "Счёт: $SCORE | Enter=прыжок, Ctrl+C=выход"
    
    sleep $SPEED
done

# Восстановление терминала
stty echo icanon
tput cnorm
