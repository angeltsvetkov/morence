
import { db } from './src/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const translations = [
    { key: 'bookNow', bg: 'Резервирай сега', en: 'Book Now' },
];

async function addTranslations() {
    const translationsCollection = collection(db, 'translations');

    for (const trans of translations) {
        const q = query(translationsCollection, where('key', '==', trans.key));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(translationsCollection, trans);
            console.log(`Added translation for key: ${trans.key}`);
        } else {
            console.log(`Translation for key: ${trans.key} already exists.`);
        }
    }
    console.log('Script finished.');
}

addTranslations();
