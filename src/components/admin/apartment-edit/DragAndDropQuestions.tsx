import React from 'react';
import { SurveyQuestion } from '../../../types';
import { useAdminLanguage } from '../../../hooks/useAdminLanguage';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface DragAndDropQuestionsProps {
    surveyQuestions: SurveyQuestion[];
    onEdit: (question: SurveyQuestion) => void;
    onDelete: (questionId: string) => void;
    onDragEnd: (result: DropResult) => void;
}

const DragAndDropQuestions: React.FC<DragAndDropQuestionsProps> = ({
    surveyQuestions,
    onEdit,
    onDelete,
    onDragEnd
}) => {
    const { t, language: adminLanguage } = useAdminLanguage();

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="survey-questions">
                {(provided) => (
                    <div
                        className="space-y-3"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {[...surveyQuestions]
                            .sort((a, b) => a.order - b.order)
                            .map((question, index) => (
                            <Draggable key={question.id} draggableId={question.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`flex items-center p-4 bg-gray-50 rounded-lg transition-all ${
                                            snapshot.isDragging 
                                                ? 'shadow-lg bg-white border-2 border-blue-300 rotate-1' 
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {/* Drag Handle */}
                                        <div 
                                            {...provided.dragHandleProps}
                                            className="cursor-move text-gray-600 hover:text-gray-800 p-2 mr-3 rounded hover:bg-gray-200 transition-colors"
                                            title={t('dragToReorder')}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                            </svg>
                                        </div>

                    {/* Question Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium text-gray-600">
                                #{index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                question.type === 'rating' ? 'bg-yellow-100 text-yellow-800' :
                                question.type === 'text' ? 'bg-blue-100 text-blue-800' :
                                question.type === 'choice' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {question.type === 'rating' ? '⭐ Rating' :
                                 question.type === 'text' ? '📝 Text' :
                                 question.type === 'choice' ? `☑️ Choice${question.maxSelections && question.maxSelections > 1 ? ` (${question.maxSelections})` : ''}` :
                                 '✅ Yes/No'}
                            </span>
                            {question.required && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                    {t('required')}
                                </span>
                            )}
                            {question.isStandard && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                    {t('standard')}
                                </span>
                            )}
                        </div>
                        <div className="text-gray-900 font-medium">
                            {adminLanguage === 'bg' ? question.question.bg : question.question.en}
                        </div>
                        {question.type === 'choice' && question.options && (
                            <div className="mt-2 text-xs text-gray-600">
                                <strong>{t('availableOptions')}:</strong> {
                                    adminLanguage === 'bg' 
                                        ? (question.options.bg || []).join(', ')
                                        : (question.options.en || []).join(', ')
                                }
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={() => onEdit(question)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title={t('edit')}
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => onDelete(question.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title={t('delete')}
                        >
                            🗑️
                        </button>
                                                        </div>
                                </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DragAndDropQuestions; 