export const DEMO_PASSWORD = 'Demo@1234';

export const DEMO_USERS = {
  admin: 'demo+admin@shopkart.demo',
  merchant1: 'demo+merchant1@shopkart.demo',
  merchant2: 'demo+merchant2@shopkart.demo',
  customer: 'demo+customer@shopkart.demo',
  customer2: 'demo+customer2@shopkart.demo',
} as const;

export function assertSeedAllowed(): void {
  if (process.env.SEED_ALLOW !== 'true') {
    console.error(
      'Seed blocked: set SEED_ALLOW=true in server/.env before running seed scripts.',
    );
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('Seed blocked: MONGODB_URI is not set.');
    process.exit(1);
  }
}

export function printDemoCredentials(): void {
  console.log('\n========================================');
  console.log('Demo seed completed successfully');
  console.log('========================================');
  console.log(`Password (all accounts): ${DEMO_PASSWORD}`);
  console.log(`  Admin:     ${DEMO_USERS.admin}`);
  console.log(`  Merchant:  ${DEMO_USERS.merchant1} (TechZone)`);
  console.log(`             ${DEMO_USERS.merchant2} (HomeStyle)`);
  console.log(`  Customer:  ${DEMO_USERS.customer}`);
  console.log(`             ${DEMO_USERS.customer2}`);
  console.log('\nRemove demo data: npm run seed:clear');
  console.log('========================================\n');
}
