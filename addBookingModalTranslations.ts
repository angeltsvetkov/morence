
import { db } from './src/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const translations = [
    { key: 'bookYourStay', bg: 'Резервирайте престоя си', en: 'Book Your Stay' },
    { key: 'startDate', bg: 'Начална дата', en: 'Start Date' },
    { key: 'endDate', bg: 'Крайна дата', en: 'End Date' },
    { key: 'startDateRequired', bg: 'Началната дата е задължителна', en: 'Start date is required' },
    { key: 'endDateRequired', bg: 'Крайната дата е задължителна', en: 'End date is required' },
    { key: 'cancel', bg: 'Отказ', en: 'Cancel' },
    { key: 'confirmBooking', bg: 'Потвърди резервацията', en: 'Confirm Booking' },
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
