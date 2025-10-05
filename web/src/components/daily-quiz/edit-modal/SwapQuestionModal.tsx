'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { QuizQuestion } from '@/lib/types/api.types';

interface SwapQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionIndex: number;
  candidates: any[];
  loading: boolean;
  onSelectQuestion: (question: any) => void;
}

export default function SwapQuestionModal({
  isOpen,
  onClose,
  questionIndex,
  candidates,
  loading,
  onSelectQuestion
}: SwapQuestionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Swap Question</h3>
            <p className="text-sm text-gray-600 mt-1">
              Replace Q{questionIndex + 1} with a different question
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading available questions...</span>
            </div>
          ) : (
            <div className="h-full overflow-y-scroll p-6" style={{ minHeight: '300px' }}>
              <h4 className="font-medium text-gray-900 mb-4">
                Available Questions ({candidates.length})
              </h4>
              
              {candidates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No available questions to swap with.</p>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {candidates.map((question: any) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between p-4 pb-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 capitalize">
                            {question.difficulty}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                            {question.questionType}
                          </span>
                          {question.themesJSON && question.themesJSON.length > 0 && (
                            <div className="flex items-center space-x-1">
                              {question.themesJSON.slice(0, 2).map((theme: string) => (
                                <span key={theme} className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">
                                  {theme}
                                </span>
                              ))}
                              {question.themesJSON.length > 2 && (
                                <span className="text-xs text-gray-500">+{question.themesJSON.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onSelectQuestion(question)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                        >
                          Select
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <div className="text-sm text-gray-800">
                          {question.promptJSON?.task || 'Question content not available'}
                        </div>
                        
                        {/* Show a preview of the question if it has specific content */}
                        {question.promptJSON?.album && (
                          <div className="mt-2">
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              Album: {question.promptJSON.album}
                            </span>
                          </div>
                        )}
                        
                        {question.promptJSON?.lyric && (
                          <div className="mt-2 text-xs text-gray-600 italic">
                            "{question.promptJSON.lyric}"
                          </div>
                        )}
                        
                        {question.promptJSON?.items && Array.isArray(question.promptJSON.items) && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-600">
                              Items: {question.promptJSON.items.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}