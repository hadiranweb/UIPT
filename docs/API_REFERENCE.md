# مرجع APIهای اکوسیستم ONSOUR

## ۱. مرجع هسته Rust (`rts_core`)

هسته اصلی ران‌تایم توابع زیر را برای محاسبات فاز و مدیریت نودها ارائه می‌دهد:

### الف) ساختارهای داده (`state.rs`)
- `Node`: نود مینیمال با فیلدهای `theta`, `e`, `ec` (اندازه: ۱۲ بایت).
- `NodePractical`: نود کاربردی شامل تاریخچه و پرچم‌ها (اندازه: ۲۴ بایت).
- `Edge`: یال گراف تنک شامل `src`, `dst`, `weight` (اندازه: ۱۲ بایت).

### ب) توابع ریاضی و گذار فاز (`math.rs`)
- `step_node_math(theta_prev: f32, e: f32, ec: f32, neighbor_sum: f32) -> f32`: محاسبه مقدار جدید پارامتر نظم با استفاده از تابع `tanh`.
- `alpha(theta: f32) -> f32`: محاسبه کانال تحریکی $\alpha = (\theta + 1) / 2$.

### ج) مدیریت گراف (`graph.rs`)
- `step_sparse_impl(nodes: &mut [Node], edges: &[Edge])`: اجرای گام زمانی روی گراف تنک در سمت Rust.
- `step_sparse_js(nodes: JsValue, edges: JsValue) -> JsValue`: نسخه سازگار با WebAssembly برای تبادل مستقیم داده با جاوا اسکریپت/تایپ‌اسکریپت.

---

## ۲. مرجع لایه ارتباطی TypeScript (`uipt-bridge.ts`)

کلاس `TanhBrainEngine` در بسته فرانت‌اند پل ارتباطی میان رابط کاربری و ماژول WASM را برقرار می‌کند:

```typescript
export class TanhBrainEngine {
    constructor(wasmModule: any);
    public stepNode(node: UIPTNode, neighborSum: number): number;
    public getAlpha(theta: number): number;
    public updateGraph(nodes: UIPTNode[], edges: UIPTRelation[]): UIPTNode[];
}
```
