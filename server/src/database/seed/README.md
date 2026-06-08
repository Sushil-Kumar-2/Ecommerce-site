# Demo Seed Data

Isolated demo fixtures for showcasing the ShopKart ecommerce app. All seeded documents are marked with `isDemoSeed: true`.

## Prerequisites

1. MongoDB running locally (or remote URI in `.env`)
2. In `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce-db
SEED_ALLOW=true
```

## Commands

From the `server/` directory:

```bash
npm run seed        # Upsert demo data (safe to re-run)
npm run seed:clear  # Delete all documents where isDemoSeed=true
```

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | `demo+admin@shopkart.demo` | `Demo@1234` |
| Merchant (TechZone) | `demo+merchant1@shopkart.demo` | `Demo@1234` |
| Merchant (HomeStyle) | `demo+merchant2@shopkart.demo` | `Demo@1234` |
| Customer | `demo+customer@shopkart.demo` | `Demo@1234` |
| Customer | `demo+customer2@shopkart.demo` | `Demo@1234` |

## What gets seeded

- 8 categories, 28 approved products (with images, discounts, featured flags)
- 5 users, 2 addresses, wishlist, cart, recently viewed
- 6 orders (mixed statuses), 4 reviews, 3 coupons
- Inventory transactions, product reports, audit logs

## Remove from project

1. Delete this folder: `server/src/database/seed/`
2. Remove `seed` and `seed:clear` from `server/package.json`
3. Optionally remove `isDemoSeed` field from Mongoose schemas (optional; unused by app logic)
4. Run `npm run seed:clear` once before deletion to clean the database

## Safety

- Scripts refuse to run unless `SEED_ALLOW=true`
- Upserts only match demo emails, slugs, and order numbers — existing real data is not overwritten
