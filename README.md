# اکوسیستم یکپارچه ONSOUR (`onsour-unified`)

**وضعیت:** Level 2.0 (Production-Ready) ✅  
**گواهی‌نامه:** حاکمیت ترمودینامیکی پویا (Dynamic Thermodynamic Governance) تایید شد.

## ۱. نمای کلی
مونو‌ریپوی **ONSOUR Unified** زیرساخت بنیادین برای توسعه‌ی سیستم‌های هوشمند، بلادرنگ و واکنش‌گر است. این پروژه با ادغام نظریه‌ی **انتقال فاز تعاملی یکپارچه (UIPT)** و ران‌تایم قدرتمند **Tanh-Brain**، پلی میان پژوهش‌های علمی در پایتون و اجرای عملیاتی با کارایی بالا در Rust برقرار کرده است.

---

## ۲. مستندات کلیدی فاز ۲
- [🚀 گزارش اتمام فاز ۲ (Phase 2 Completion)](./docs/PHASE_2_COMPLETION_REPORT.md): خلاصه دستاوردهای معماری کاربردی.
- [⚖️ پروتکل حاکمیت ترمودینامیکی (Governance Protocol)](./docs/GOVERNANCE_BENCHMARK_REPORT.md): جزئیات حاکمیت دترمینستیک و ایمن.
- [📖 راهنمای توسعه‌دهندگان (Developer Guide)](./docs/DEVELOPER_GUIDE.md): راهنمای راه‌اندازی محیط و گردش کار.
- [🏗️ مستند معماری (Architecture)](./docs/ARCHITECTURE.md): تحلیل عمیق مدل Tanh-Brain و معماری جزیره‌ای.

---

## ۳. ساختار مونو‌ریپو
```text
onsour-unified/
├── theory/               # مدل‌های ۴ لایه‌ای (Operational, Evidence, Context, Knowledge)
├── backend/
│   ├── core/             # rts_core (Rust), rts_wasm (WebAssembly), onsour_governance
│   ├── islands/          # Commerce Reef, Finance Lagoon
│   ├── runtime/          # Island Runtime with Rollback support
│   └── synaptic-hub/     # OmniArch 5-checkpoint orchestrator
├── docs/                 # مستندات فنی، بنچ‌مارک‌ها و گزارش‌های پایداری
└── Makefile              # سیستم ساخت و تست یکپارچه (v1.3 compatible)
```

---

## ۴. قابلیت‌های شاخص (Level 2 Features)
- **Exact Replayability**: ثبت تمامی تصمیمات حاکمیتی در `GovernanceSnapshot` برای بازپخش ۱۰۰٪ قطعی.
- **Deterministic Rollback**: قابلیت بازگشت به وضعیت قبل در صورت رد تراکنش توسط حاکمیت.
- **WASM Bridge**: اجرای مستقیم موتور محاسباتی در مرورگر با سرعت بومی.
- **Fail-safe Telemetry**: مقاومت کامل در برابر داده‌های Stale یا نامعتبر (`NaN/Inf`).

---

## ۵. بنچ‌مارک‌های حاکمیتی (Governance Stats)
- **تاخیر تنظیم اپسیلون**: **~3.7 نانوثانیه**.
- **سربار نظارتی کل**: کمتر از **40 نانوثانیه** در هر اپوک.
- **پایداری**: مجهز به فیلتر **EMA Smoothing** برای حذف نویزهای سیستم.

---

## ۶. شروع سریع (Quick Start)
```bash
# راه‌اندازی و اجرای تست‌های صحت
make check-correctness

# کامپایل به WASM برای فرانت‌اند
cd backend/core/rts_wasm && wasm-pack build --target web
```

---
*Certified by Manus AI for Production Stability.*
