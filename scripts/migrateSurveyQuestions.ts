import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../src/firebase'; // Adjust path as needed

const migrateSurveyQuestions = async () => {
    console.log('Starting migration of survey questions...');
    const apartmentsSnapshot = await getDocs(collection(db, 'apartments'));

    if (apartmentsSnapshot.empty) {
        console.log('No apartments found. Exiting.');
        return;
    }

    let apartmentsMigrated = 0;
    const promises = apartmentsSnapshot.docs.map(async (aptDoc) => {
        const apartment = aptDoc.data();
        const apartmentId = aptDoc.id;

        if (apartment.surveyQuestions && Array.isArray(apartment.surveyQuestions) && apartment.surveyQuestions.length > 0) {
            console.log(`Migrating questions for apartment: ${apartment.name?.en || apartmentId}`);
            
            const batch = writeBatch(db);

            apartment.surveyQuestions.forEach((question: any, index: number) => {
                const { id, ...questionData } = question;
                const newQuestionRef = doc(collection(db, `apartments/${apartmentId}/surveyQuestions`));
                
                batch.set(newQuestionRef, {
                    ...questionData,
                    order: question.order ?? index,
                });
            });

            // After setting up the new subcollection, clear the old array
            const apartmentRef = doc(db, 'apartments', apartmentId);
            batch.update(apartmentRef, { surveyQuestions: [] }); // or deleteField()

            try {
                await batch.commit();
                console.log(`Successfully migrated questions for ${apartment.name?.en || apartmentId}`);
                apartmentsMigrated++;
            } catch (error) {
                console.error(`Error migrating questions for ${apartment.name?.en || apartmentId}:`, error);
            }
        }
    });

    await Promise.all(promises);

    console.log(`Migration complete. ${apartmentsMigrated} apartment(s) had questions migrated.`);
};

migrateSurveyQuestions().catch(console.error); 