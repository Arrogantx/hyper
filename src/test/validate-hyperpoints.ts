/**
 * HyperPoints Integration Validation Script
 * 
 * This script validates that the HyperPoints integration is properly configured.
 * Run with: npx tsx src/test/validate-hyperpoints.ts
 */

import { HYPER_POINTS_ABI } from '../contracts/abis';
import { getCurrentNetworkAddresses } from '../contracts/addresses';

console.log('🔍 Validating HyperPoints Integration...\n');

// Test 1: Validate ABI exists and has required functions
console.log('✅ Test 1: HyperPoints ABI Validation');
const requiredFunctions = [
  'balanceOf',
  'totalSupply', 
  'name',
  'symbol',
  'decimals',
  'transfer',
  'approve',
  'allowance',
  'mint',
  'burn',
  'minter',
  'owner'
];

const abiFunctions = HYPER_POINTS_ABI
  .filter(item => item.type === 'function')
  .map(item => item.name)
  .filter(name => name !== undefined) as string[];

let missingFunctions = requiredFunctions.filter(func => !(abiFunctions as any).includes(func));

if (missingFunctions.length === 0) {
  console.log('   ✓ All required functions present in ABI');
} else {
  console.log('   ❌ Missing functions:', missingFunctions);
}

// Test 2: Validate contract address
console.log('\n✅ Test 2: Contract Address Validation');
const addresses = getCurrentNetworkAddresses();
const hyperPointsAddress = addresses.HYPER_POINTS;

if (hyperPointsAddress && hyperPointsAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
  console.log('   ✓ HyperPoints address is valid:', hyperPointsAddress);
} else {
  console.log('   ❌ Invalid HyperPoints address:', hyperPointsAddress);
}

// Test 3: Validate events
console.log('\n✅ Test 3: Events Validation');
const requiredEvents = ['Transfer', 'Approval', 'MinterUpdated', 'OwnershipTransferred'];
const abiEvents = HYPER_POINTS_ABI
  .filter(item => item.type === 'event')
  .map(item => item.name)
  .filter(name => name !== undefined) as string[];

let missingEvents = requiredEvents.filter(event => !(abiEvents as any).includes(event));

if (missingEvents.length === 0) {
  console.log('   ✓ All required events present in ABI');
} else {
  console.log('   ❌ Missing events:', missingEvents);
}

// Test 4: Validate specific function signatures
console.log('\n✅ Test 4: Function Signature Validation');

const mintFunction = HYPER_POINTS_ABI.find(
  item => item.type === 'function' && item.name === 'mint'
);

if (mintFunction && 
    mintFunction.inputs?.length === 2 &&
    mintFunction.inputs[0].type === 'address' &&
    mintFunction.inputs[1].type === 'uint256') {
  console.log('   ✓ Mint function signature is correct');
} else {
  console.log('   ❌ Mint function signature is incorrect');
}

const burnFunction = HYPER_POINTS_ABI.find(
  item => item.type === 'function' && item.name === 'burn'
);

if (burnFunction && 
    burnFunction.inputs?.length === 1 &&
    burnFunction.inputs[0].type === 'uint256') {
  console.log('   ✓ Burn function signature is correct');
} else {
  console.log('   ❌ Burn function signature is incorrect');
}

// Test 5: Validate constructor
console.log('\n✅ Test 5: Constructor Validation');
const constructor = HYPER_POINTS_ABI.find(item => item.type === 'constructor');

if (constructor) {
  console.log('   ✓ Constructor is present in ABI');
} else {
  console.log('   ❌ Constructor is missing from ABI');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`   • ABI Functions: ${abiFunctions.length} total, ${requiredFunctions.length} required`);
console.log(`   • ABI Events: ${abiEvents.length} total, ${requiredEvents.length} required`);
console.log(`   • Contract Address: ${hyperPointsAddress}`);
console.log(`   • Missing Functions: ${missingFunctions.length}`);
console.log(`   • Missing Events: ${missingEvents.length}`);

if (missingFunctions.length === 0 && missingEvents.length === 0 && hyperPointsAddress) {
  console.log('\n🎉 HyperPoints integration validation PASSED!');
} else {
  console.log('\n❌ HyperPoints integration validation FAILED!');
}

// Export for potential use in other scripts
export const validationResults = {
  abiFunctions,
  abiEvents,
  hyperPointsAddress,
  missingFunctions,
  missingEvents,
  isValid: missingFunctions.length === 0 && missingEvents.length === 0 && !!hyperPointsAddress
};