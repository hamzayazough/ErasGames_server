'use client';

import { useState } from 'react';
import AiVisualQuestionFormWrapper from '@/components/forms/AiVisualQuestionFormWrapper';

export function AiVisualFormDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log('Submitted data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert('Question created successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create AI Visual Question</h1>
      <AiVisualQuestionFormWrapper 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}