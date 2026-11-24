# Деплой Dopamine на Vercel

Проект — статический сайт на Vite (React + TypeScript + Tailwind v4).
Сервера, базы данных и переменных окружения нет: Vercel сам собирает `dist/` из исходников.

| Параметр          | Значение          |
|-------------------|-------------------|
| Framework Preset  | **Vite**          |
| Install Command   | `npm install`     |
| Build Command     | `npm run build`   |
| Output Directory  | `dist`            |
| Node.js Version   | 20.x или 22.x     |
| Env variables     | не нужны          |

> Номер WhatsApp не секрет и лежит в `src/config.ts`.

---

## 0. Перед деплоем — проверить локально

```bash
npm install
npm test           # unit tests
npm run build      # должно закончиться «✓ built»
npm run preview    # открыть http://localhost:4173 и проверить сайт
```

## 1. Отправить код на GitHub

```bash
git push origin main
```

Репозиторий: https://github.com/BatyrAman/Dopamine

## 2. Вариант А — через сайт Vercel (рекомендуется)

1. Зайти на https://vercel.com и войти через GitHub.
2. **Add New… → Project**.
3. В списке выбрать репозиторий **BatyrAman/Dopamine** → **Import**
   (если его нет — **Adjust GitHub App Permissions** и дать доступ к репозиторию).
4. Настройки проекта:
   - **Framework Preset:** Vite (определится автоматически)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - Environment Variables — оставить пустыми.
5. **Deploy**. Через 1–2 минуты появится адрес вида `https://dopamine-xxxx.vercel.app`.

После этого:
- каждый `git push` в `main` → автоматический production-деплой;
- каждый push в другую ветку / pull request → отдельный preview-адрес для проверки.

## 3. Вариант Б — через Vercel CLI

```bash
npm install -g vercel
vercel login
vercel            # первый раз: ответить на вопросы (scope, имя проекта, ./), получить preview
vercel --prod     # выложить в production
```

CLI сам определит Vite и `dist`. Папка `.vercel/` создаётся локально и в git не коммитится.

## 4. Свой домен (по желанию)

1. Vercel → проект → **Settings → Domains → Add** (например `dopamine.kz`).
2. У регистратора домена добавить DNS-записи, которые покажет Vercel
   (обычно `A 76.76.21.21` для корня и `CNAME cname.vercel-dns.com` для `www`).
3. HTTPS-сертификат Vercel выпустит автоматически.

## 5. Проверка после деплоя

- [ ] Сайт открывается, шрифты Montserrat Alternates / Golos Text загрузились (казахские буквы ә, ғ, қ, ң, ө, ұ, ү, і отображаются).
- [ ] Конструктор: собрать бокс → «Тексеру» → пустая форма не отправляется, показывает ошибки.
- [ ] Дата доставки ≥ 7 дней вперёд → «Сіз 10% жеңілдікке ие болдыңыз!», сумма пересчиталась.
- [ ] «WhatsApp арқылы тапсырыс беру» открывает `wa.me/77757785945` с текстом заказа.
- [ ] Мобильная версия: нижняя панель «Боксым» и шторка открываются.

## Частые проблемы

| Симптом | Причина / решение |
|---|---|
| `tsc` падает на Vercel, локально нет | Локально запустить `npm run build` и исправить ошибки типов — build сначала запускает `tsc -b`. |
| `npm install` падает | Закоммитить актуальный `package-lock.json`. |
| Старая версия после push | Vercel → **Deployments** → проверить, что деплой из нужной ветки/коммита; при необходимости **Redeploy**. |
| Откат | Vercel → **Deployments** → выбрать прошлый деплой → **Promote to Production**. |
