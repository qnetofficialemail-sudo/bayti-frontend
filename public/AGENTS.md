# Bayti (بيتي)

Bayti is a bilingual (Arabic/English) local marketplace for the UAE, connecting home-based sellers with buyers. Sellers list handmade crafts, home cooking, abayas, perfumes, skincare, and home decor; buyers browse by category, message sellers directly, and order for local pickup or delivery.

## Stack

- Frontend: React (Create React App) + TypeScript + Tailwind CSS, deployed on Vercel at https://www.bayti.ink
- Backend: FastAPI + SQLAlchemy (PostgreSQL), deployed on Railway at https://web-production-63685.up.railway.app
- Content is rendered client-side; product/seller data is fetched from the API at request time, not present in the static HTML.

## Key routes

- `/` — landing page (unauthenticated)
- `/marketplace` — product browsing
- `/categories` — category listing
- `/product/:id` — product detail
- `/shop/:id` — seller's public shop page
- `/sell`, `/seller-apply` — become a seller
- `/about`, `/privacy-policy` — informational pages

## Notes for agents

- Default language is English; UAE users commonly toggle to Arabic (`dir="rtl"`) via the navbar language switcher.
- `/admin`, `/seller/dashboard`, `/seller/shop/edit`, `/login`, `/register` are disallowed in robots.txt (authenticated/internal).
- Sitemap: https://www.bayti.ink/sitemap.xml · robots: https://www.bayti.ink/robots.txt · summary for LLMs: https://www.bayti.ink/llms.txt
