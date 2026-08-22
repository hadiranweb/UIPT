# ONSOUR Web HUD — Developer Guide

این سند راهنمای توسعه‌ی نسخه‌ی وب ONSOUR در شاخه‌ی `feature/onsour-web-hud` از مخزن `hadiranweb/UIPT` است. هدف این شاخه، ارائه‌ی یک سطح محصول/مشاهده‌پذیری مستقل روی هسته‌ی UIPT است؛ هسته‌ی Rust، قراردادهای نظری UIPT و لایه‌ی وب ONSOUR باید از نظر مسئولیت و چرخه‌ی تغییر قابل تفکیک باقی بمانند.

## جایگاه پروژه در مخزن

نسخه‌ی وب در مسیر `frontend/apps/onsour-investor-site/` قرار دارد تا فایل‌ها و workspace موجود UIPT بازنویسی نشوند. این برنامه یک full-stack TypeScript است و از React، Vite، Express، tRPC، Drizzle ORM و MySQL/TiDB استفاده می‌کند.

| مسیر | مسئولیت |
|---|---|
| `client/` | رابط React، صفحات `/`, `/docs` و `/theory`، Live Dispersion Lab و Graph Explorer |
| `server/` | Express، tRPC، احراز هویت Manus، persistence و دسترسی database |
| `shared/` | قراردادهای مشترک، انواع و schemaهای نسخه‌دار UIPT |
| `drizzle/` | schema و migrationهای database |
| `docs/` | مستندات معماری، source map نظری و روش‌شناسی benchmark |
| `scripts/` | ابزارهای validation محلی |
| `package.json` | scriptهای `dev`, `check`, `test`, `build` و `start` |

## قواعد معماری

**نظریه پیش از محصول است.** معادلات UIPT، قراردادهای نمادین و source map باید قبل از تغییر در visualization یا runtime surface بررسی شوند. صفحه‌ی `/theory` برای ارائه‌ی Landau–Ginzburg، Mean-Field Tanh، گذار فاز و مسیر Langevin است و باید تفاوت میان نظریه، browser preview و Rust/WASM runtime را صریح نگه دارد.

**محاسبه دو فاز است.** هر تحلیل graph باید از جریان `State(t) [immutable] → Gather → NeighborSums → Apply → State(t+1) → swap` تبعیت کند. رابط کاربر نباید الگوریتمی را به‌عنوان Rayon واقعی معرفی کند، اگر در مرورگر فقط preview تک‌نخی اجرا شده است.

**Provenance بخشی از داده است.** تحلیل ذخیره‌شده باید schema version، engine version، numeric mode، governance version، snapshot hash و state root را در قرارداد و persistence نگه دارد. تغییر در قراردادها باید همراه تست round-trip و بررسی migration انجام شود.

**GenFlow خارج از scope است.** این شاخه فقط برای ONSOUR/UIPT است و نباید dependency، لینک، کد یا تصمیم معماری پروژه‌های دیگر را وارد کند.

## اجرای محلی

پیش‌نیازهای معمول، Node.js سازگار با پروژه و pnpm هستند. پس از دریافت شاخه، در مسیر برنامه اجرا کنید:

```bash
cd frontend/apps/onsour-investor-site
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm dev
```

سرور توسعه روی آدرس محلی نمایش‌داده‌شده توسط Vite اجرا می‌شود. صفحات اصلی برای بررسی دستی عبارت‌اند از `/`، `/docs` و `/theory`.

## بررسی رابط کاربر

در `/theory`، چهار ابزار تعاملی برای پتانسیل Landau–Ginzburg، نقشه‌ی گذار فاز، پاسخ Mean-Field Tanh و مسیر Langevin بررسی می‌شوند. کنترل‌ها باید مقدار معتبر بپذیرند، replay با seed ثابت باید تکرارپذیر بماند و حالت `prefers-reduced-motion` باید خروجی ایستا و قابل خواندن ارائه دهد.

در `/docs`، Live Dispersion Lab با graph نمونه آغاز می‌شود. توسعه‌دهنده باید بارگذاری JSON، اعتبارسنجی node و edge، تنظیم ε، تصمیم accept/rollback، Graph Explorer، انتخاب node، فیلتر cluster و export را بررسی کند. HUD گراف باید dispersion، میانگین تغییر θ، میانگین θ، چگالی topology و شاخص reference Rayon را با واحد و توضیح روشن نمایش دهد.

## معنای benchmark

بنچمارک Rayon فعلی به workload قطعی زنجیره‌ی ۱۰٬۰۰۰ نودی با ۱۰۰ epoch اندازه‌گیری‌شده، ۱۰ warmup و release profile اشاره می‌کند. مرجع ثبت‌شده در `benchmark-report.md` برابر **95.44 ns/node/epoch** است. این مقدار یک single-machine reference measurement است و نباید به‌عنوان سرعت عمومی همه‌ی سخت‌افزارها یا به‌عنوان اجرای native زنده در مرورگر معرفی شود.

نتیجه‌ی مرورگر از همان شکل workload و تبدیل state استفاده می‌کند، اما با `performance.now()` در tab فعلی و به‌صورت single-threaded preview اندازه‌گیری می‌شود. بنابراین نسبت browser به Rayon ابزار مقایسه‌ی روش‌شناختی است، نه ادعای production throughput.

## Database و secrets

برای مسیر persistence، محیط اجرا باید configuration معتبر database و احراز هویت داشته باشد. نام متغیرهای مورد استفاده از `server/_core/env.ts` استخراج می‌شود:

| متغیر | کاربرد |
|---|---|
| `DATABASE_URL` | اتصال MySQL/TiDB |
| `JWT_SECRET` | امضای session cookie |
| `VITE_APP_ID` | شناسه‌ی OAuth |
| `OAUTH_SERVER_URL` | backend OAuth |
| `OWNER_OPEN_ID` | شناسه‌ی مالک |
| `BUILT_IN_FORGE_API_URL` | APIهای داخلی سرویس |
| `BUILT_IN_FORGE_API_KEY` | کلید server-side API |
| `VITE_OAUTH_PORTAL_URL` | آدرس ورود frontend |

مقادیر secret در Git commit نمی‌شوند و فایل `.env` نباید به repository افزوده شود. پیش از migration، schema Drizzle و SQL تولیدشده را بازبینی کنید و migration را فقط روی database متعلق به همان محیط اجرا کنید.

## تست‌ها و قرارداد تغییر

قبل از هر pull request، این ترتیب را رعایت کنید:

```bash
pnpm check
pnpm test
pnpm build
```

تست‌های موجود قراردادهای UIPT، محاسبات عددی، persistence و math utilityهای Theory را پوشش می‌دهند. برای تغییر در یک feature، ابتدا تست pure یا contract آن را اضافه/اصلاح کنید، سپس UI را تغییر دهید. screenshot مرورگر جایگزین تست واحد نیست و تست واحد نیز جایگزین بررسی responsive نیست.

هر تغییر معماری باید در مستندات همان شاخه توضیح داده شود. برای تغییرات بزرگ، commitها را کوچک و قابل cherry-pick نگه دارید و هرگز برای رفع اختلاف از `git reset --hard` استفاده نکنید؛ از branch یا rollback کنترل‌شده استفاده کنید.

## گردش کار branch

این شاخه برای review ایجاد شده است. توسعه‌دهنده باید branch را از آخرین `origin/main` دریافت کند، تغییرات را در همین شاخه انجام دهد و قبل از merge نتیجه‌ی check/test/build را در pull request بنویسد. merge به `main` در این مرحله خودکار نیست و نیازمند بازبینی معماری و correctness است.
