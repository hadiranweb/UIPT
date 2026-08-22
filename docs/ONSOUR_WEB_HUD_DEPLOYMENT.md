# ONSOUR Web HUD — Deployment Guide

این راهنما استقرار برنامه‌ی وب ONSOUR را از شاخه‌ی `feature/onsour-web-hud` توضیح می‌دهد. هدف، استقراری است که کد، schema، secrets و benchmark provenance را از هم تفکیک کند و پیش از انتشار production قابل بازبینی باشد.

## اصل استقرار

برنامه‌ی ONSOUR یک full-stack TypeScript است؛ client با Vite ساخته می‌شود و server bundle با esbuild تولید می‌گردد. استقرار باید از root برنامه در `frontend/apps/onsour-investor-site/` انجام شود. درخت `node_modules/`، `dist/`، لاگ‌ها، فایل‌های `.env` و artifactهای sandbox نباید بخشی از commit یا artifact ورودی deployment باشند.

## پیش‌نیازهای محیط

محیط build باید Node.js سازگار با lockfile و pnpm داشته باشد. در CI از نصب frozen استفاده کنید تا dependency graph دقیقاً از `pnpm-lock.yaml` خوانده شود:

```bash
cd frontend/apps/onsour-investor-site
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

خروجی build شامل `dist/public` برای client و `dist/index.js` برای server است. اجرای production از script زیر انجام می‌شود:

```bash
NODE_ENV=production pnpm start
```

در محیط managed hosting، port را hardcode نکنید؛ server باید port قرارداده‌شده توسط runtime را مصرف کند. اگر platform command جداگانه می‌خواهد، build command برابر `pnpm build` و start command برابر `pnpm start` باشد.

## پیکربندی و secrets

مقادیر واقعی باید در secret manager محیط deployment وارد شوند و هرگز در Git commit نشوند. `server/_core/env.ts` متغیرهای اصلی زیر را مصرف می‌کند:

| نام | الزام | کاربرد |
|---|---|---|
| `DATABASE_URL` | برای persistence الزامی | اتصال MySQL/TiDB |
| `JWT_SECRET` | برای auth الزامی | امضای session cookie |
| `VITE_APP_ID` | در OAuth الزامی | شناسه‌ی application |
| `OAUTH_SERVER_URL` | در OAuth الزامی | endpoint سرویس OAuth |
| `VITE_OAUTH_PORTAL_URL` | در login frontend الزامی | portal ورود |
| `OWNER_OPEN_ID` | در deployment مالک‌محور الزامی | شناسه‌ی owner |
| `BUILT_IN_FORGE_API_URL` | برای قابلیت‌های داخلی | base URL API داخلی |
| `BUILT_IN_FORGE_API_KEY` | server-side و محرمانه | احراز هویت API داخلی |

در صورت استفاده از connector یا secret manager پلتفرم، نام متغیرها را دقیقاً حفظ کنید. مقدارهای واقعی را در issue، pull request، log یا فایل configuration عمومی قرار ندهید.

## Database migration

قبل از production، `drizzle/schema.ts` را با migrationهای repository تطبیق دهید. migration باید در محیط staging اجرا و سپس verify شود. چون داده‌ی database قابل جایگزینی با build نیست، هر migration destructive نیازمند backup و تأیید مستقل است.

الگوی محلی تولید migration چنین است:

```bash
pnpm drizzle-kit generate
```

فایل SQL تولیدشده را بازبینی کنید. در محیطی که migration runner رسمی پروژه در دسترس است، migration را با همان runner اجرا کنید؛ از اجرای دستی SQL ناشناخته روی production خودداری کنید. تغییرات provenance در `saved_analyses` باید همراه با تست round-trip save/list/get بررسی شوند.

## Release checklist

| کنترل | معیار پذیرش |
|---|---|
| Source | branch درست و commit SHA ثبت شده باشد |
| Dependencies | `pnpm install --frozen-lockfile` موفق باشد |
| Type safety | `pnpm check` بدون خطا باشد |
| Tests | همه‌ی تست‌های Vitest موفق باشند |
| Build | `pnpm build` برای client و server موفق باشد |
| Secrets | هیچ `.env` یا credential در diff نباشد |
| Database | schema و migration با محیط مقصد هماهنگ باشند |
| Auth | OAuth callback و session در staging بررسی شده باشند |
| UI | `/`, `/docs` و `/theory` در staging باز شوند |
| Benchmark | Rayon به‌عنوان reference تک‌ماشینه و browser به‌عنوان preview برچسب خورده باشند |
| Rollback | commit قبلی و روش بازگشت ثبت شده باشد |

هشدار اندازه‌ی chunk بعد از minification لزوماً failure نیست، اما باید برای performance review ثبت شود. آن را با حذف measurement یا ادعای سرعت بیشتر پنهان نکنید.

## Smoke test پس از استقرار

پس از انتشار staging یا production، مسیرهای زیر را بررسی کنید:

```text
/
/docs
/theory
```

در `/docs`، Live Dispersion Lab را با graph نمونه اجرا کنید، HUD و شاخص reference Rayon را ببینید، سپس benchmark browser preview را اجرا کنید. ذخیره و بازیابی یک analysis باید provenance کامل را حفظ کند. در `/theory`، کنترل‌های چهار visualization و حالت reduced-motion را بررسی کنید.

اگر OAuth یا database در محیط حاضر نیست، باید وضعیت را به‌عنوان configuration failure گزارش کنید؛ نباید با داده‌ی mock یا credential موقت نتیجه را موفق اعلام کرد.

## Rollback و incident handling

برای rollback برنامه، به آخرین commit تأییدشده‌ی branch یا release artifact برگردید و database را جداگانه ارزیابی کنید. rollback کد به‌طور خودکار schema database را rollback نمی‌کند. در incident، ابتدا traffic یا release را متوقف، logهای server را بررسی و SHA فعال را ثبت کنید؛ سپس با migration و data owner درباره‌ی database تصمیم بگیرید.

## مرزهای شاخه

این راهنما برای ONSOUR/UIPT است. merge به `main`، انتقال به `onsour-unified` و هرگونه ادغام با GenFlow خارج از این deployment change است و نیازمند تصمیم معماری جداگانه خواهد بود.
