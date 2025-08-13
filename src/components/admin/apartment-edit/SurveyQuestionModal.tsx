import React, { useState, useEffect } from 'react';
import { SurveyQuestion } from '../../../types';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import Modal from '../../common/Modal';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface SurveyQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: SurveyQuestion) => Promise<void>;
    onDelete: (questionId: string) => Promise<void>;
    question: SurveyQuestion | null;
    surveyLanguageMode?: 'multilingual' | 'bulgarian' | 'english';
    showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

const SurveyQuestionModal: React.FC<SurveyQuestionModalProps> = ({ isOpen, onClose, onSave, onDelete, question, surveyLanguageMode, showConfirmation }) => {
    const { t } = useAdminLanguage();
    const [editedQuestion, setEditedQuestion] = useState<SurveyQuestion | null>(question);
    const [isSaving, setIsSaving] = useState(false);
    const [questionFormLanguage, setQuestionFormLanguage] = useState<'bg' | 'en'>('bg');
    const [newOptionText, setNewOptionText] = useState('');
    const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
    const [editingOptionText, setEditingOptionText] = useState('');

    useEffect(() => {
        setEditedQuestion(question);
    }, [question]);

    useEffect(() => {
        if (isOpen) {
            if (surveyLanguageMode === 'english') {
                setQuestionFormLanguage('en');
            } else {
                setQuestionFormLanguage('bg');
            }
        }
    }, [isOpen, surveyLanguageMode]);

    if (!editedQuestion) return null;

    const handleSave = async () => {
        if (editedQuestion) {
            setIsSaving(true);
            await onSave(editedQuestion);
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (question) {
            showConfirmation(
                t('confirmDelete'),
                t('confirmDeleteQuestion'),
                async () => {
                    setIsSaving(true);
                    await onDelete(question.id);
                    setIsSaving(false);
                    onClose(); // Close modal after delete
                }
            );
        }
    };

    const addOption = (language: 'bg' | 'en') => {
        if (newOptionText.trim() && editedQuestion) {
            const currentOptions = editedQuestion.options || { bg: [], en: [] };
            const updatedOptions = {
                bg: currentOptions.bg || [],
                en: currentOptions.en || [],
                [language]: [...(currentOptions[language] || []), newOptionText.trim()]
            };
            setEditedQuestion({
                ...editedQuestion,
                options: updatedOptions
            });
            setNewOptionText('');
        }
    };

    const deleteOption = (language: 'bg' | 'en', index: number) => {
        if (editedQuestion?.options?.[language]) {
            const currentOptions = editedQuestion.options;
            const updatedOptions = {
                bg: currentOptions.bg || [],
                en: currentOptions.en || [],
                [language]: currentOptions[language].filter((_, i) => i !== index)
            };
            setEditedQuestion({
                ...editedQuestion,
                options: updatedOptions
            });
        }
    };

    const startEditingOption = (language: 'bg' | 'en', index: number) => {
        if (editedQuestion?.options?.[language]?.[index]) {
            setEditingOptionIndex(index);
            setEditingOptionText(editedQuestion.options[language][index]);
        }
    };

    const saveEditingOption = (language: 'bg' | 'en') => {
        if (editedQuestion?.options?.[language] && editingOptionIndex !== null && editingOptionText.trim()) {
            const currentOptions = editedQuestion.options;
            const updatedOptions = {
                bg: currentOptions.bg || [],
                en: currentOptions.en || [],
                [language]: currentOptions[language].map((option, i) => 
                    i === editingOptionIndex ? editingOptionText.trim() : option
                )
            };
            setEditedQuestion({
                ...editedQuestion,
                options: updatedOptions
            });
            setEditingOptionIndex(null);
            setEditingOptionText('');
        }
    };

    const cancelEditingOption = () => {
        setEditingOptionIndex(null);
        setEditingOptionText('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('editQuestion')}</h2>
                <div className="space-y-4">
                    <div>
                        {surveyLanguageMode && surveyLanguageMode !== 'multilingual' && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <strong>{t('surveyLanguageMode')}:</strong> {surveyLanguageMode === 'bulgarian' ? t('surveyLanguageBulgarian') : t('surveyLanguageEnglish')}
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="editQuestionText">{t('questionText')}</Label>
                            {(!surveyLanguageMode || surveyLanguageMode === 'multilingual') && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setQuestionFormLanguage('bg')}
                                        className={`px-3 py-1 text-xs rounded ${questionFormLanguage === 'bg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        БГ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuestionFormLanguage('en')}
                                        className={`px-3 py-1 text-xs rounded ${questionFormLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        EN
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Multilingual Mode */}
                        {(!surveyLanguageMode || surveyLanguageMode === 'multilingual') && (
                            <>
                                <Input
                                    id="editQuestionText"
                                    value={editedQuestion.question[questionFormLanguage] || ''}
                                    onChange={(e) => setEditedQuestion(prev => prev ? { 
                                        ...prev, 
                                        question: { 
                                            ...prev.question,
                                            [questionFormLanguage]: e.target.value 
                                        } 
                                    } : null)}
                                    className="w-full"
                                    placeholder={t('enterQuestionText')}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {questionFormLanguage === 'bg' ? t('bulgarianVersion') : t('englishVersion')}
                                </div>
                            </>
                        )}

                        {/* Single Language Mode: Bulgarian */}
                        {surveyLanguageMode === 'bulgarian' && (
                            <Input
                                id="editQuestionText"
                                value={editedQuestion.question.bg || ''}
                                onChange={(e) => setEditedQuestion(prev => prev ? { 
                                    ...prev, 
                                    question: { ...prev.question, bg: e.target.value }
                                } : null)}
                                className="w-full"
                                placeholder={t('enterQuestionText')}
                            />
                        )}

                        {/* Single Language Mode: English */}
                        {surveyLanguageMode === 'english' && (
                            <Input
                                id="editQuestionText"
                                value={editedQuestion.question.en || ''}
                                onChange={(e) => setEditedQuestion(prev => prev ? { 
                                    ...prev, 
                                    question: { ...prev.question, en: e.target.value }
                                } : null)}
                                className="w-full"
                                placeholder={t('enterQuestionText')}
                            />
                        )}
                    </div>
                    {/* Question Type and Max Selections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="editQuestionType">{t('questionType')}</Label>
                            <select
                                id="editQuestionType"
                                value={editedQuestion.type}
                                onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, type: e.target.value as SurveyQuestion['type'] } : null)}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="rating">{t('ratingQuestion')} (1-5 ⭐)</option>
                                <option value="text">{t('textQuestion')} (Open text)</option>
                                <option value="yesno">{t('yesNoQuestion')} (Yes/No)</option>
                                <option value="choice">{t('choiceQuestion')} (Multiple choice)</option>
                            </select>
                        </div>

                        {/* Max Selections for Multiple Choice */}
                        {editedQuestion.type === 'choice' && (
                            <div>
                                <Label htmlFor="maxSelections" className="text-sm font-medium text-gray-900">{t('maxSelections')}</Label>
                                <Input
                                    id="maxSelections"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={editedQuestion.maxSelections || 1}
                                    onChange={(e) => setEditedQuestion(prev => prev ? { 
                                        ...prev, 
                                        maxSelections: parseInt(e.target.value) || 1 
                                    } : null)}
                                    className="mt-1"
                                />
                                <div className="mt-1 text-xs text-gray-500">
                                    {editedQuestion.maxSelections === 1 
                                        ? t('singleSelectionNote') 
                                        : t('multipleSelectionNote').replace('{count}', String(editedQuestion.maxSelections || 1))
                                    }
                                </div>
                            </div>
                        )}
                    </div>                    {/* Multiple Choice Options Editor */}
                    {editedQuestion.type === 'choice' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <Label className="text-sm font-medium text-gray-900">{t('manageOptions')}</Label>
                                {(!surveyLanguageMode || surveyLanguageMode === 'multilingual') && (
                                    <div className="text-xs text-gray-600">
                                        {t('editingOptionsFor')}: <span className={`px-2 py-1 rounded text-xs font-medium ${questionFormLanguage === 'bg' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {questionFormLanguage === 'bg' ? 'Български' : 'English'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Options for Current Language Only */}
                            <div>
                                {/* Get current language for options */}
                                {(() => {
                                    let currentLang: 'bg' | 'en' = 'bg';
                                    if (surveyLanguageMode === 'english') currentLang = 'en';
                                    else if (surveyLanguageMode === 'bulgarian') currentLang = 'bg';
                                    else currentLang = questionFormLanguage;
                                    
                                    return (
                                        <>
                                            {/* Existing Options */}
                                            <div className="space-y-2 mb-3">
                                                {editedQuestion.options?.[currentLang] && editedQuestion.options[currentLang].length > 0 ? (
                                                    editedQuestion.options[currentLang].map((option, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-sm bg-white rounded border p-2">
                                                            <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                                                {index + 1}
                                                            </span>
                                                            {editingOptionIndex === index ? (
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    <Input
                                                                        value={editingOptionText}
                                                                        onChange={(e) => setEditingOptionText(e.target.value)}
                                                                        className="flex-1 text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        onClick={() => saveEditingOption(currentLang)}
                                                                        className="text-green-600 hover:text-green-700 p-1"
                                                                        title={t('save')}
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEditingOption}
                                                                        className="text-gray-600 hover:text-gray-700 p-1"
                                                                        title={t('cancel')}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="text-gray-700 flex-1">{option}</span>
                                                                    <button
                                                                        onClick={() => startEditingOption(currentLang, index)}
                                                                        className="text-blue-600 hover:text-blue-700 p-1"
                                                                        title={t('edit')}
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteOption(currentLang, index)}
                                                                        className="text-red-600 hover:text-red-700 p-1"
                                                                        title={t('delete')}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-gray-500 italic p-2">{t('noOptionsAdded')}</div>
                                                )}
                                            </div>
                                            
                                            {/* Add New Option */}
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newOptionText}
                                                    onChange={(e) => setNewOptionText(e.target.value)}
                                                    placeholder={t('addNewOption')}
                                                    className="flex-1 text-sm"
                                                    onKeyPress={(e) => e.key === 'Enter' && addOption(currentLang)}
                                                />
                                                <Button
                                                    onClick={() => addOption(currentLang)}
                                                    disabled={!newOptionText.trim()}
                                                    className={`px-3 py-1 text-sm ${currentLang === 'bg' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                >
                                                    {t('add')}
                                                </Button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            id="editQuestionRequired"
                            type="checkbox"
                            checked={editedQuestion.required}
                            onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, required: e.target.checked } : null)}
                            className="rounded"
                        />
                        <Label htmlFor="editQuestionRequired">{t('requiredQuestion')}</Label>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <Button
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isSaving}
                    >
                        {isSaving ? t('deleting') : (t('delete') || 'Delete')}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>{t('cancel')}</Button>
                        <Button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={(!editedQuestion?.question.bg && !editedQuestion?.question.en) || isSaving}
                        >
                            {isSaving ? t('saving') : t('saveChanges')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SurveyQuestionModal; 