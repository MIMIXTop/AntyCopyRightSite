# AntyCopyRight

Фронтенд веб-приложения для анализа файлов на нарушение авторских прав.

## Технологии

- **React 19** — UI-фреймворк
- **TypeScript** — типизация
- **Vite** — сборка и Dev-сервер
- **Ant Design** — UI-компоненты
- **Material Tailwind** — дизайн-система
- **Tailwind CSS** — стилизация
- **Google OAuth** — авторизация
- **Google Classroom API** — интеграция с Google Classroom

## Структура проекта

```
src/
├── components/        # React-компоненты
│   ├── AppContent.tsx
│   ├── AppHeader.tsx
│   ├── AuthContext.tsx
│   ├── MainLayout.tsx
│   └── Sidebar.tsx
├── services/          # API-сервисы
│   ├── api.ts         # Базовый класс для запросов
│   ├── ClassroomService.ts
│   └── TokenStore.ts
├── types/             # TypeScript-типы
│   └── auth.ts
├── App.tsx
└── main.tsx
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск dev-сервера
bun run dev

# Сборка для продакшена
bun run build

# Предпросмотр продакшена
bun run preview

# Линтинг
bun run lint
```

## Особенности

- Авторизация через Google OAuth
- Интеграция с Google Classroom API
- Анализ файлов на нарушение авторских прав
- Тёмная тема интерфейса
- Адаптивный дизайн
