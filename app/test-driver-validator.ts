#!/usr/bin/env bun
/**
 * Test script for the driver licence validator
 * Usage: bun run test-driver-validator.ts
 */

import { checkDriverLicence, validateDriverStatus } from './src/lib/server/driverLicenceValidator';

// Example data: Tobiasz, Gleba, AA004967
const name = 'Tobiasz';
const surname = 'Gleba';
const documentNumber = 'AA004967';

console.log('🚗 Testing Driver Licence Validator\n');
console.log('Test Data:');
console.log(`  Name: ${name}`);
console.log(`  Surname: ${surname}`);
console.log(`  Document: ${documentNumber}\n`);
console.log('─'.repeat(50));

async function runTests() {
	try {
		// Test 1: Check driver licence (get raw JSON)
		console.log('\n📋 Test 1: checkDriverLicence()');
		console.log('⏳ Fetching driver data...\n');
		
		const startTime1 = Date.now();
		const data = await checkDriverLicence(name, surname, documentNumber);
		const duration1 = ((Date.now() - startTime1) / 1000).toFixed(2);
		
		if (data) {
			console.log(`✅ Success! (${duration1}s)\n`);
			console.log('Raw JSON Response:');
			console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
			
			if (data.dokumentPotwierdzajacyUprawnienia) {
				const doc = data.dokumentPotwierdzajacyUprawnienia;
				console.log('Extracted Information:');
				console.log(`  Document Number: ${doc.seriaNumerBlankietuDruku}`);
				console.log(`  Status: ${doc.stanDokumentu?.stanDokumentu?.wartosc}`);
				console.log(`  Expiry Date: ${doc.dataWaznosci}`);
				console.log(`  Issuing Authority: ${doc.organWydajacyDokument?.wartosc}`);
				if (doc.daneUprawnieniaKategorii) {
					const categories = doc.daneUprawnieniaKategorii.map((k: any) => k.kategoria).join(', ');
					console.log(`  Categories: ${categories}`);
				}
			}
		} else {
			console.log(`❌ Failed to fetch data (${duration1}s)`);
			process.exit(1);
		}
		
		// Test 2: Validate driver status (boolean check)
		console.log('\n─'.repeat(50));
		console.log('\n🔍 Test 2: validateDriverStatus()');
		console.log('⏳ Validating status (Wydany + not expired)...\n');
		
		const startTime2 = Date.now();
		const isValid = await validateDriverStatus(name, surname, documentNumber);
		const duration2 = ((Date.now() - startTime2) / 1000).toFixed(2);
		
		console.log(`${isValid ? '✅' : '❌'} Valid: ${isValid} (${duration2}s)\n`);
		
		if (isValid) {
			console.log('✓ Document status is "Wydany"');
			console.log('✓ Document has not expired');
		} else {
			console.log('✗ Document status is NOT "Wydany" or has expired');
		}
		
		console.log('\n' + '─'.repeat(50));
		console.log('\n✅ All tests completed successfully!\n');
		process.exit(0);
		
	} catch (error) {
		console.error('\n❌ Test failed:', error);
		process.exit(1);
	}
}

runTests();

