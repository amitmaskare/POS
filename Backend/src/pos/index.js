import { posManager } from './POSManager.js';
import { GenericSerialPOS } from './drivers/GenericSerialPOS.js';
import { PineLabsPOS } from './drivers/PineLabsPOS.js';
import { IngenicoPOS } from './drivers/IngenicoP OS.js';
import { VerifonePOS } from './drivers/VerifonePOS.js';
import { PAXPOS } from './drivers/PAXPOS.js';

/**
 * Initialize POS system and register all device drivers
 */
export function initializePOS() {
  console.log('🚀 Initializing POS system...');

  // Register all available device drivers
  posManager.registerDriver('generic', GenericSerialPOS);
  posManager.registerDriver('pinelabs', PineLabsPOS);
  posManager.registerDriver('ingenico', IngenicoPOS);
  posManager.registerDriver('verifone', VerifonePOS);
  posManager.registerDriver('pax', PAXPOS);

  console.log('✅ POS system initialized with 5 device drivers');
}

export { posManager };
export * from './POSDevice.js';
export * from './POSManager.js';
