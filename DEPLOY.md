# 🚀 Деплой Нова Версія Себе → Telegram Mini App

## Структура проекту
```
nova-versia-app/
├── src/
│   ├── main.jsx       ← точка входу + Telegram SDK init
│   └── App.jsx        ← весь додаток
├── index.html         ← HTML з Telegram WebApp SDK
├── vite.config.js     ← base: '/nova-versia/'
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml ← авто-деплой на GitHub Pages
```

---

## КРОК 1 — Підготовка (один раз)

Встанови Git і Node якщо немає:
- Git: https://git-scm.com/downloads
- Node 20+: https://nodejs.org

---

## КРОК 2 — Створи репозиторій на GitHub

1. Зайди на https://github.com/new
2. Назва репо: **nova-versia**
3. Visibility: **Public** (обов'язково для GitHub Pages безкоштовно)
4. Натисни **Create repository**

---

## КРОК 3 — Залий код

Відкрий термінал у папці `nova-versia-app/` і виконай:

```bash
git init
git add .
git commit -m "init: Nova Versia app"
git branch -M main
git remote add origin https://github.com/ТВІЙ_ЮЗЕРНЕЙМ/nova-versia.git
git push -u origin main
```

Замість `ТВІЙ_ЮЗЕРНЕЙМ` — твій GitHub username.

---

## КРОК 4 — Увімкни GitHub Pages

1. Зайди в репозиторій → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Збережи

GitHub автоматично запустить деплой. Через 1-2 хвилини твій додаток буде на:
```
https://ТВІЙ_ЮЗЕРНЕЙМ.github.io/nova-versia/
```

---

## КРОК 5 — Створи Telegram бота

1. Знайди **@BotFather** у Telegram
2. Відправ `/newbot`
3. Назва: `Нова версія себе`
4. Username: `nova_versia_bot` (або будь-який вільний)
5. Збережи токен: `123456789:AABBCCddEEff...`

---

## КРОК 6 — Підключи Mini App до бота

У BotFather:
```
/newapp
```
Вибери свого бота → заповни:
- **Title**: Нова версія себе
- **Description**: 21-денна трансформація ідентичності
- **Photo**: будь-яке фото (640×360px мінімум)
- **Web App URL**: `https://ТВІЙ_ЮЗЕРНЕЙМ.github.io/nova-versia/`

Або якщо хочеш кнопку в меню бота:
```
/setmenubutton
```
Вибери бота → Web App URL → вставляй URL.

---

## КРОК 7 — Додай команду /start

Відправ BotFather:
```
/setcommands
```
Вибери бота → вставляй:
```
start - Відкрити додаток
```

---

## КРОК 8 — Перевір

1. Знайди свого бота в Telegram
2. Натисни /start або кнопку меню
3. Mini App відкривається ✅

---

## Оновлення додатку

Будь-який `git push` → GitHub Actions автоматично збирає і деплоїть. Зазвичай 60-90 секунд.

```bash
git add .
git commit -m "update: опис змін"
git push
```

---

## Важливо: API ключ Anthropic

Додаток використовує Anthropic API для AI-коуча.
Поточна версія робить запити напряму з браузера — це ОК для особистого використання.

Для публічного бота додай проксі або serverless function.

---

## Структура даних (localStorage)

```json
{
  "name": "Дмитро",
  "identity": "Діяю чітко, будую системно",
  "avoid": "Не відкладає рішення",
  "startDate": "2026-03-18",
  "days": {
    "2026-03-18": {
      "morningRating": 8,
      "morningAnswer": "...",
      "morningWord": "дія",
      "morningDone": true,
      "eveningRating": 7,
      "eveningAnswer": "...",
      "eveningWord": "зростання",
      "eveningDone": true,
      "habits": {
        "ritual": true,
        "micro": true,
        "noPhone": false,
        "training": true,
        "evening": true
      }
    }
  }
}
```
