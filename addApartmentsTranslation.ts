
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './src/firebase';

const addApartmentsTranslation = async () => {
  const translationsRef = doc(db, 'translations', 'apartments');

  try {
    const docSnap = await getDoc(translationsRef);

    if (docSnap.exists()) {
      console.log("Document 'apartments' already exists in translations. No action taken.");
      return;
    }

    await setDoc(translationsRef, {
      en: 'Apartments',
      bg: 'Апартаменти',
      ru: 'Апартаменты',
      de: 'Wohnungen',
      ro: 'Apartamente',
      pl: 'Apartamenty',
      cs: 'Apartmány',
      sk: 'Apartmány',
    });
    console.log("Successfully added 'apartments' translation to Firestore.");
  } catch (error) {
    console.error("Error adding 'apartments' translation: ", error);
  }
};

addApartmentsTranslation().then(() => {
    // Optional: Close database connection if necessary, though not typically needed for client SDK in scripts
    console.log('Script finished.');
});
