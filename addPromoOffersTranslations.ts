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
    await addOrUpdateTranslation('promoOffersTitle', 'Special Offers', 'Специални оферти');
    await addOrUpdateTranslation('promoOffer1Title', 'Early Booking Discount', 'Отстъпка за ранни записвания');
    await addOrUpdateTranslation('promoOffer1Desc', 'Book your summer vacation by the end of May and get a 15% discount.', 'Резервирайте своята лятна почивка до края на месец май и вземете 15% отстъпка.');
    await addOrUpdateTranslation('promoOffer2Title', 'Last Minute Offer', 'Оферта в последната минута');
    await addOrUpdateTranslation('promoOffer2Desc', 'Book within 7 days of arrival and get a 10% discount.', 'Резервирайте в рамките на 7 дни преди датата на пристигане и получете 10% отстъпка.');
    await addOrUpdateTranslation('promoOffer3Title', 'Long Stay Discount', 'Отстъпка за дълъг престой');
    await addOrUpdateTranslation('promoOffer3Desc', 'Stay 10 nights or more and get a 20% discount.', 'Останете 10 или повече нощувки и получете 20% отстъпка.');
    
    // We need to exit the process, otherwise vite-node will hang
    process.exit(0);
}

run();
