import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./src/firebase";

const translationsCollection = collection(db, "translations");

async function addOrUpdateTranslation(key: string, en: string, bg: string) {
  try {
    const q = query(translationsCollection, where("key", "==", key));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(translationsCollection, { key, en, bg });
      console.log(`Successfully added translation for key: ${key}`);
    } else {
      console.log(`Translation key "${key}" already exists. No action taken.`);
    }
  } catch (e) {
    console.error("Error adding or updating document: ", e);
  }
}

async function run() {
    await addOrUpdateTranslation(
        'address',
        'Greenlife Beach Resort, Kavaci, Sozopol, Bulgaria',
        'Greenlife Beach Resort, Каваци, Созопол, България'
    );
    
    // We need to exit the process, otherwise vite-node will hang
    process.exit(0);
}

run();
