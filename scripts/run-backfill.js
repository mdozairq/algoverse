#!/usr/bin/env node

/**
 * Script to run the supply data backfill
 * Usage: node scripts/run-backfill.js
 */

const { backfillSupplyData } = require('./backfill-supply-data');

async function main() {
  console.log('🚀 Starting supply data backfill process...');
  
  try {
    await backfillSupplyData();
    console.log('✅ Backfill process completed successfully!');
  } catch (error) {
    console.error('❌ Backfill process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
