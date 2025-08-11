// Migration script to add ownerId to existing apartments
// This script should be run once to assign the super admin as owner of all existing apartments

import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const SUPER_ADMIN_ID = import.meta.env.VITE_SUPER_ADMIN_ID;

export const migrateApartmentOwnership = async () => {
  if (!SUPER_ADMIN_ID) {
    console.error('VITE_SUPER_ADMIN_ID environment variable is not set');
    return { success: false, error: 'Super admin ID not configured' };
  }

  try {
    console.log('Starting apartment ownership migration...');
    
    const apartmentsRef = collection(db, 'apartments');
    const snapshot = await getDocs(apartmentsRef);
    
    const batch: Promise<void>[] = [];
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Only update if ownerId doesn't already exist
      if (!data.ownerId) {
        batch.push(
          updateDoc(doc(db, 'apartments', docSnap.id), {
            ownerId: SUPER_ADMIN_ID
          })
        );
      }
    });
    
    // Execute all updates
    await Promise.all(batch);
    
    console.log(`Successfully migrated ${batch.length} apartments to have ownerId: ${SUPER_ADMIN_ID}`);
    console.log('Migration completed successfully!');
    
    return { success: true, count: batch.length };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, error };
  }
};

// Export for use in development console or admin panel
if (typeof window !== 'undefined') {
  (window as any).migrateApartmentOwnership = migrateApartmentOwnership;
}
