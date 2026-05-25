# Кайдзен — система маленьких шагов

Тихий минималистичный инструмент для контент-креатора на основе методики Максима Дорофеева («Джедайские техники») и принципа кайдзен.

## Запуск локально

```bash
# 1. Клонируй и установи зависимости
git clone https://github.com/almirmusali/kaizen-steps.git
cd kaizen-steps
npm install

# 2. Настрой API-ключ
cp .env.example .env
# Открой .env и вставь ANTHROPIC_API_KEY=sk-ant-...
# Получить ключ: https://console.anthropic.com/settings/keys

# 3. Запусти (фронт + API-сервер одновременно)
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173)

> Без API-ключа приложение работает в ручном режиме — все функции, кроме AI.

## Деплой на Vercel

1. Создай репозиторий на GitHub и запушь код:
   ```bash
   git init
   git add .
   git commit -m "init: Кайдзен MVP"
   git remote add origin https://github.com/almirmusali/kaizen-steps.git
   git push -u origin main
   ```
2. Открой [vercel.com](https://vercel.com) → **New Project** → импортируй репозиторий
3. В **Environment Variables** добавь:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
4. Нажми **Deploy** — всё готово.

## Стек

- React 19 + Vite + TypeScript
- TailwindCSS (минималистичная дизайн-система)
- Zustand (стейт)
- Dexie/IndexedDB (локальное хранилище)
- Anthropic API через Vercel Serverless / Express dev-server

## Структура

```
src/
  db/            # Dexie-репозитории (data-layer)
  store/         # Zustand-стор
  services/      # AI-сервис
  screens/       # Экраны приложения
  components/    # UI-компоненты
  i18n/ru.ts     # Все строки интерфейса
api/
  claude.ts      # Vercel Serverless Function
server.ts        # Dev-сервер для локальной разработки
```
