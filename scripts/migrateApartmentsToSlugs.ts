import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { slugify } from '../src/lib/utils';

const migrateApartments = async () => {
    console.log('Starting apartment migration...');
    const apartmentsRef = collection(db, 'apartments');
    const snapshot = await getDocs(apartmentsRef);

    if (snapshot.empty) {
        console.log('No apartments found to migrate.');
        return;
    }

    const migrationPromises = snapshot.docs.map(async (document) => {
        const apartment = document.data();
        const apartmentId = document.id;

        if (!apartment.slug && apartment.name) {
            const newSlug = slugify(apartment.name);
            console.log(`Apartment "${apartment.name}" (${apartmentId}) is missing a slug. Adding slug: "${newSlug}"`);
            const docRef = doc(db, 'apartments', apartmentId);
            await updateDoc(docRef, { slug: newSlug });
            console.log(`Successfully updated apartment ${apartmentId}.`);
        } else if (apartment.slug) {
            console.log(`Apartment "${apartment.name}" (${apartmentId}) already has a slug: "${apartment.slug}". Skipping.`);
        } else {
            console.log(`Apartment ${apartmentId} has no name, cannot generate slug. Skipping.`);
        }
    });

    await Promise.all(migrationPromises);
    console.log('Apartment migration completed.');
};

migrateApartments().catch(error => {
    console.error('Error during apartment migration:', error);
    process.exit(1);
});
