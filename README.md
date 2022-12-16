# Настройка проекта

Установка зависимостей

    npm install

Создать файл .env в корневом каталоге и добавить конфигурацию БД 

    DATABASE_URL="mysql://root:secret@localhost:3306/project"

Добавить в .env токен вашего бота Telegram(по дефолту бот https://t.me/catalog_new_logs_bot) 

    TELEGRAM_API="<token>"

Выполнить миграцию БД из конфигурации ORM Prisma

    npx prisma migrate dev

Запуск taiwindcss

    npm run tailwind

Запуск веб-сервера

    npm run dev