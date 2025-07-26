// This script is intended to be run once to migrate translations to Firestore.
// You can run it with `ts-node migrateTranslations.ts`
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { translations as localTranslations } from './src/translations';
import { firebaseConfig } from './src/firebase'; // Assuming you have this export in your firebase.ts

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadTranslations = async () => {
  console.log('Starting translation upload to Firestore...');
  const translationsCollectionRef = collection(db, 'translations');

  const promises = Object.entries(localTranslations).map(async ([key, value]) => {
    try {
      await setDoc(doc(translationsCollectionRef, key), value);
      console.log(`Successfully uploaded: ${key}`);
    } catch (error) {
      console.error(`Error uploading ${key}:`, error);
    }
  });

  await Promise.all(promises);
  console.log('Translation upload finished.');
};

uploadTranslations().catch(error => {
    console.error("Migration script failed:", error);
});
