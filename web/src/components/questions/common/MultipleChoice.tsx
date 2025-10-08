'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Choice {
  id: string;
  text: string;
}

interface MultipleChoiceProps {
  choices: Choice[] | string[];
  onSelect?: (choice: string | number) => void;
  selectedChoice?: string | number;
  disabled?: boolean;
}

export function MultipleChoice({ 
  choices, 
  onSelect, 
  selectedChoice, 
  disabled = false 
}: MultipleChoiceProps) {
  const [localSelected, setLocalSelected] = useState<string | number | null>(selectedChoice ?? null);

  const handleSelect = (choice: string | number, index: number) => {
    if (disabled) return;
    
    const value = typeof choice === 'string' ? index : choice;
    setLocalSelected(value);
    onSelect?.(value);
  };

  const normalizedChoices = choices.map((choice, index) => {
    if (typeof choice === 'string') {
      return { id: `choice${index}`, text: choice };
    }
    return choice;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {normalizedChoices.map((choice, index) => {
        const isSelected = localSelected === index || localSelected === choice.id;
        
        return (
          <Button
            key={choice.id}
            variant={isSelected ? "default" : "outline"}
            className={`p-4 h-auto text-left justify-start ${
              isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelect(choice.text, index)}
            disabled={disabled}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{choice.text}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}