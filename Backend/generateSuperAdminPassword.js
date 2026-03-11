/**
 * Generate Super Admin Password Hash
 *
 * Run this script to generate bcrypt hash for Super Admin password
 * Usage: node generateSuperAdminPassword.js
 */

import bcrypt from 'bcrypt';

const SUPER_ADMIN_PASSWORD = 'SuperAdmin@123';
const SALT_ROUNDS = 10;

async function generatePasswordHash() {
  try {
    const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, SALT_ROUNDS);

    console.log('\n========================================');
    console.log('SUPER ADMIN PASSWORD HASH GENERATED');
    console.log('========================================\n');
    console.log('Password:', SUPER_ADMIN_PASSWORD);
    console.log('Hash:', hash);
    console.log('\nUpdate the migration file with this hash:');
    console.log(`'${hash}'`);
    console.log('\n========================================\n');

    // Verify the hash works
    const isValid = await bcrypt.compare(SUPER_ADMIN_PASSWORD, hash);
    console.log('Hash verification:', isValid ? '✓ Valid' : '✗ Invalid');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generatePasswordHash();
