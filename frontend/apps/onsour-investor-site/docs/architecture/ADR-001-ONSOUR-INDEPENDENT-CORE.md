# ADR-001: ONSOUR به‌عنوان هسته‌ی مستقل و قابل اتصال

**Status:** Accepted
**Date:** 2026-08-20
**Scope:** ONSOUR/UIPT foundation cycle

## Context

ONSOUR/UIPT و GenFlow دو مسیر متفاوت دارند. GenFlow برای جریان‌های AI، ابزارها و درآمد عملیاتی توسعه پیدا می‌کند، در حالی که ONSOUR/UIPT باید نظریه، runtime عددی، thermodynamic governance، replay و نمایش قابل توضیح را به‌صورت دقیق و مرحله‌ای تثبیت کند. ادغام زودهنگام این دو مسیر باعث می‌شود correctness و مرزهای زیرساختی ONSOUR تحت فشار feature، زمان‌بندی و نیازهای درآمدی GenFlow قرار گیرد.

## Decision

ONSOUR/UIPT در این دوره به‌عنوان یک **هسته‌ی مستقل، versioned و قابل اتصال** توسعه پیدا می‌کند. GenFlow در این cycle هیچ کپی، dependency، API runtime، schema مشترک یا تغییر کدی در ONSOUR ایجاد نمی‌کند. اتصال آینده فقط از طریق یک adapter مستقل و قرارداد versioned انجام خواهد شد.

لایه‌های ONSOUR به این ترتیب مرزبندی می‌شوند:

1. **Theory:** تعریف‌های UIPT و source map ریاضی.
2. **State & Numeric Kernel:** Node، Edge، fixed-point و arithmetic.
3. **Graph Execution:** adjacency، Gather/Apply، double buffering و determinism.
4. **Thermodynamic Governance:** dispersion، epsilon، snapshots و rollback.
5. **WASM Boundary:** API امن و versioned برای browser.
6. **Shared Contracts:** schema، provenance و replay metadata.
7. **Product Surfaces:** Theory، Docs، Live Dispersion Lab و Graph Explorer.
8. **Persistence & Operations:** tRPC، Drizzle، MySQL، testing، CI/CD و release.

## Consequences

### Positive

ONSOUR می‌تواند correctness و determinism را بدون فشار بیرونی تثبیت کند. هر لایه source of truth و گیت پذیرش خود را دارد. GenFlow بعداً می‌تواند یک مصرف‌کننده‌ی پایدار باشد، بدون آن‌که implementation داخلی Rust یا تصمیم‌های governance به workflowهای آن نشت کند.

### Negative

در کوتاه‌مدت قابلیت‌های جدید میان دو پروژه تکرار می‌شوند و اتصال درآمدی فوری ایجاد نمی‌شود. همچنین باید برای adapter و compatibility testing در آینده زمان جداگانه اختصاص داده شود.

### Neutral

`onsour-investor-site` فعلاً محصول وب و مشاهده‌پذیری ONSOUR باقی می‌ماند؛ `hadiranweb/UIPT` مرجع نظری و low-level runtime است. این تصمیم مقصد فیزیکی آینده‌ی monorepo را از پیش قطعی نمی‌کند.

## Rejected alternatives

| گزینه | دلیل رد |
|---|---|
| انتقال فوری کد GenFlow به ONSOUR | وابستگی پنهان و آمیختن معیارهای درآمدی با correctness هسته |
| انتقال فوری Rust core به web repository بدون قرارداد | نشت memory layout و ایجاد coupling میان UI و ABI |
| تبدیل browser preview به مرجع قطعی | floating-point browser هنوز معادل اثبات‌شده‌ی fixed-point Rust نیست |
| ساخت adapter پیش از تثبیت core | adapter خطاهای لایه‌ی پایین را پنهان و مسیر debug را پیچیده می‌کند |

## Acceptance criteria

این ADR زمانی بازبینی می‌شود که native core، governance replay، WASM shadow mode، shared contracts و persistence provenance از گیت‌های برنامه عبور کرده باشند. تا آن زمان، هر درخواست اتصال به GenFlow باید به‌عنوان خارج از scope این cycle رد یا به backlog آینده منتقل شود.
