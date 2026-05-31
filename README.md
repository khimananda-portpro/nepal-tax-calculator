# Nepal Income Tax Calculator

A React + Vite app to estimate Nepal personal income tax across fiscal years.

## Features

- **FY 2083/84 (2026/27)** new budget slabs (exemption Rs 10 lakh, top rate 29%) and **FY 2082/83 (2025/26)** slabs, switchable.
- Single vs. married (couple) filing status.
- Monthly / yearly income input.
- Itemised, statutory-capped deductions: EPF, CIT, SSF (combined Rs 5,00,000 retirement pool, capped at ⅓ of assessable income), life insurance (Rs 40,000), health insurance (Rs 20,000).
- Automatic 1% Social Security Tax waiver for SSF contributors.
- Slab-by-slab tax breakdown, effective rate, and **monthly take-home (in bank)**.

> For guidance only — verify with a tax professional or the Inland Revenue Department.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview
```

## Deploy (Cloudflare Pages)

- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`
