import { useLanguage } from '../../hooks/useLanguage';

const Contacts = () => {
    const { t } = useLanguage();

    return (
        <div className="bg-white p-8 rounded-lg shadow-md my-8">
            <h2 className="text-3xl font-bold text-center mb-6">{t('contacts')}</h2>
            <div className="flex flex-col md:flex-row justify-around items-center text-center">
                <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold">{t('phone')}</h3>
                    <p className="text-lg text-gray-600">+359 888 888 888</p>
                </div>
                <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold">{t('email')}</h3>
                    <p className="text-lg text-gray-600">
                        <a href="mailto:morence@example.com" className="text-blue-600 hover:underline">
                            morence@example.com
                        </a>
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold">{t('address')}</h3>
                    <p className="text-lg text-gray-600">Sozopol, Bulgaria</p>
                </div>
            </div>
        </div>
    );
};

export default Contacts;
