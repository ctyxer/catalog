# Настройка проекта

Установка зависимостей

    npm install

Создать файл .env в корневом каталоге и добавить конфигурацию БД

    DATABASE_URL="mysql://root:secret@localhost:3306/project"

Выполнить миграцию БД из конфигурации ORM Prisma

    npx prisma migrate dev

Создание папок для сохранения

    npm run build

Создание css файла с помощью Sass

    npm run sass

Запуск веб-сервера

    npm run dev