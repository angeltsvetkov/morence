import { collection, getDocs, doc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../src/firebase';

const defaultQuestions = [
    {
        question: { 
            en: 'Overall Rating', 
            bg: 'Обща оценка' 
        },
        type: 'rating' as const,
        required: true,
        order: 0,
        isStandard: true
    },
    {
        question: { 
            en: 'Cleanliness', 
            bg: 'Чистота' 
        },
        type: 'rating' as const,
        required: true,
        order: 1,
        isStandard: true
    },
    {
        question: { 
            en: 'Communication', 
            bg: 'Комуникация' 
        },
        type: 'rating' as const,
        required: true,
        order: 2,
        isStandard: true
    },
    {
        question: { 
            en: 'Location', 
            bg: 'Местоположение' 
        },
        type: 'rating' as const,
        required: true,
        order: 3,
        isStandard: true
    },
    {
        question: { 
            en: 'Value for Money', 
            bg: 'Съотношение цена-качество' 
        },
        type: 'rating' as const,
        required: true,
        order: 4,
        isStandard: true
    },
    {
        question: { 
            en: 'Would you recommend us to others?', 
            bg: 'Бихте ли ни препоръчали на други?' 
        },
        type: 'yesno' as const,
        required: true,
        order: 998,
        isStandard: true
    },
    {
        question: { 
            en: 'Additional Comments', 
            bg: 'Допълнителни коментари' 
        },
        type: 'text' as const,
        required: false,
        order: 999,
        isStandard: true
    }
];

async function initializeDefaultSurveyQuestions() {
    try {
        console.log('Starting initialization of default survey questions...');
        
        // Get all apartments
        const apartmentsSnapshot = await getDocs(collection(db, 'apartments'));
        
        for (const apartmentDoc of apartmentsSnapshot.docs) {
            const apartmentId = apartmentDoc.id;
            console.log(`Processing apartment: ${apartmentId}`);
            
            // Check if this apartment already has survey questions
            const existingQuestionsSnapshot = await getDocs(collection(db, `apartments/${apartmentId}/surveyQuestions`));
            
            if (existingQuestionsSnapshot.empty) {
                console.log(`  Adding default questions to apartment ${apartmentId}`);
                
                // Add default questions
                for (const question of defaultQuestions) {
                    await addDoc(collection(db, `apartments/${apartmentId}/surveyQuestions`), question);
                }
                
                console.log(`  ✅ Added ${defaultQuestions.length} default questions`);
            } else {
                console.log(`  ⏭️  Apartment ${apartmentId} already has questions, skipping`);
            }
        }
        
        console.log('✅ Default survey questions initialization completed!');
    } catch (error) {
        console.error('❌ Error initializing default survey questions:', error);
    }
}

// Run the script
initializeDefaultSurveyQuestions(); 