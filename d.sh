#!/bin/bash
# Цветная анимация с градиентом

colors=(31 32 33 34 35 36 91 92 93 94 95 96)
chars=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
text="✨ Загрузка завершена ✨"

i=0
while true; do
    color=${colors[i % ${#colors[@]}]}
    char=${chars[i % ${#chars[@]}]}
    
    printf "\r\033[K\033[%sm%s %s \033[0m" "$color" "$char" "$text"
    ((i++))
    sleep 0.08
done