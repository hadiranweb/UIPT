# ONSOUR Web HUD — Local Commands

این صفحه مجموعه‌ی دستورات استاندارد برای دریافت و بررسی شاخه‌ی `feature/onsour-web-hud` است.

## دریافت شاخه

```bash
git clone https://github.com/hadiranweb/UIPT.git
cd UIPT
git fetch origin
git switch --track origin/feature/onsour-web-hud
```

اگر branch قبلاً به‌صورت local وجود دارد، آن را با remote به‌روز کنید:

```bash
git switch feature/onsour-web-hud
git pull --ff-only origin feature/onsour-web-hud
```

برای بررسی شاخه، commit و تغییرات:

```bash
git branch --show-current
git log --oneline --decorate -5
git status --short
git diff origin/main...HEAD --stat
git diff origin/main...HEAD --check
```

## نصب و بررسی برنامه

```bash
cd frontend/apps/onsour-investor-site
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

ترتیب پیشنهادی این است که ابتدا dependencyها frozen نصب شوند، سپس typecheck، تست و build اجرا شود. `pnpm build` هم client و هم server bundle را تولید می‌کند.

## اجرای توسعه

```bash
cd frontend/apps/onsour-investor-site
pnpm dev
```

صفحات زیر را در browser باز کنید:

```text
/
/docs
/theory
```

در `/docs`، graph نمونه، upload JSON، governance decision، Graph Explorer، HUD و benchmark preview را بررسی کنید. در `/theory`، چهار visualization تعاملی UIPT و حالت reduced-motion را بررسی کنید.

## بررسی migration و database

```bash
cd frontend/apps/onsour-investor-site
pnpm drizzle-kit generate
```

SQL تولیدشده را پیش از اجرا بازبینی کنید. برای اجرای persistence به `DATABASE_URL` معتبر نیاز است. مقادیر secret را در shell history، commit یا pull request قرار ندهید.

## بررسی benchmark

HUD مقدار Rayon را به‌عنوان reference تک‌ماشینه نمایش می‌دهد و browser benchmark را به‌عنوان single-threaded preview اندازه می‌گیرد. برای مشاهده‌ی مقایسه:

```text
1. /docs را باز کنید.
2. در Live Dispersion Lab گزینه‌ی Run browser parity را اجرا کنید.
3. مقدار browser، reference Rayon و نسبت نسبی را مقایسه کنید.
4. تفاوت محیط اجرا را با متن benchmark note تطبیق دهید.
```

عدد reference فعلی از `benchmark-report.md` می‌آید و برای workload زنجیره‌ی قطعی ۱۰٬۰۰۰ نودی، ۱۰۰ epoch اندازه‌گیری‌شده و ۱۰ warmup برابر 95.44 ns/node/epoch است. این عدد به سخت‌افزار، compiler، thread pool و شرایط سیستم وابسته است.

## تست ایمنی قبل از commit

```bash
cd frontend/apps/onsour-investor-site
git status --short
git diff --check
find . -path './node_modules' -prune -o -path './dist' -prune -o -name '.env*' -print
pnpm check
pnpm test
pnpm build
```

هر فایل `.env*` یا credential کشف‌شده باید از commit خارج شود و از secret manager محیط استفاده شود. فایل‌های `node_modules`، `dist`، لاگ‌ها و artifactهای sandbox نیز نباید به branch افزوده شوند.

## به‌روزرسانی مشارکتی

```bash
git fetch origin
git switch feature/onsour-web-hud
git pull --ff-only origin feature/onsour-web-hud
```

تغییرات را در commitهای کوچک ثبت کنید و pull request را به `main` باز کنید. تا پایان review معماری و correctness، merge مستقیم به `main` انجام نشود.
