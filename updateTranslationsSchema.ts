import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./src/firebase";

const translationsCollection = collection(db, "translations");

async function updateSchema() {
  console.log("Starting schema update for translations...");
  try {
    const querySnapshot = await getDocs(translationsCollection);

    const updatePromises = querySnapshot.docs.map(async (documentSnapshot) => {
      const docId = documentSnapshot.id;
      const data = documentSnapshot.data();

      if (!data.key) {
        console.log(`Updating document: ${docId}`);
        const docRef = doc(db, "translations", docId);
        // Re-setting the document with the key included to ensure consistency
        await setDoc(docRef, { ...data, key: docId });
        console.log(`Successfully updated document: ${docId}`);
      } else {
        console.log(`Document ${docId} already has a key. Skipping.`);
      }
    });

    await Promise.all(updatePromises);
    console.log("Schema update finished.");

  } catch (e) {
    console.error("Error updating schema: ", e);
  }
  // We need to exit the process, otherwise vite-node will hang
  process.exit(0);
}

updateSchema();
