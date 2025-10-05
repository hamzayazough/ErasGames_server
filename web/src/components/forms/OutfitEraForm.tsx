import { useState } from 'react';
import { OutfitEraQuestion } from '@/lib/types/interfaces/questions/outfit-era.interface';
import { Difficulty } from '@/lib/types/enums/question.enums';
import MediaUpload from '@/components/ui/MediaUpload';

interface OutfitEraFormProps {
  onSubmit: (question: OutfitEraQuestion) => void;
  isSubmitting: boolean;
}

export default function OutfitEraForm({ onSubmit, isSubmitting }: OutfitEraFormProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [task, setTask] = useState('Which era does this outfit belong to?');
  const [mediaRefs, setMediaRefs] = useState<Array<{ type: 'image'; url: string }>>([]);
  const [choices, setChoices] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [themes, setThemes] = useState<string[]>(['fashion', 'eras']);
  const [subjects, setSubjects] = useState<string[]>(['eras']);

  const addMediaRef = () => {
    setMediaRefs([...mediaRefs, { type: 'image', url: '' }]);
  };

  const updateMediaRef = (index: number, url: string) => {
    const newMediaRefs = [...mediaRefs];
    newMediaRefs[index] = { type: 'image', url };
    setMediaRefs(newMediaRefs);
  };

  const removeMediaRef = (index: number) => {
    const newMediaRefs = mediaRefs.filter((_, i) => i !== index);
    setMediaRefs(newMediaRefs);
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoice = () => {
    setChoices([...choices, '']);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      const newChoices = choices.filter((_, i) => i !== index);
      setChoices(newChoices);
      // Adjust correct index if needed
      if (correctIndex >= newChoices.length) {
        setCorrectIndex(newChoices.length - 1);
      }
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, '']);
  };

  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const removeSubject = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const addTheme = () => {
    setThemes([...themes, '']);
  };

  const updateTheme = (index: number, value: string) => {
    const newThemes = [...themes];
    newThemes[index] = value;
    setThemes(newThemes);
  };

  const removeTheme = (index: number) => {
    const newThemes = themes.filter((_, i) => i !== index);
    setThemes(newThemes);
  };

  const handleImageUpload = (mediaIndex: number) => (uploadData: { url: string; filename: string; size: number }) => {
    updateMediaRef(mediaIndex, uploadData.url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!task.trim()) {
      alert('Please enter a task');
      return;
    }

    if (mediaRefs.length === 0 || !mediaRefs.every(media => media.url.trim())) {
      alert('Please add at least one media reference with a valid URL');
      return;
    }

    if (!choices.every(choice => choice.trim())) {
      alert('Please fill in all choice options');
      return;
    }

    // Create the question object matching the mock data structure
    const question: OutfitEraQuestion = {
      id: '',
      questionType: 'outfit-era',
      difficulty,
      prompt: {
        task: task.trim()
      },
      mediaRefs: mediaRefs.filter(media => media.url.trim()),
      choices: choices.filter(choice => choice.trim()),
      correct: {
        index: correctIndex
      },
      themes: themes.filter(t => t.trim()).length > 0 ? themes.filter(t => t.trim()) : undefined,
      subjects: subjects.filter(s => s.trim()).length > 0 ? subjects.filter(s => s.trim()) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(question);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-white border rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Create Outfit Era Question</h2>
        
        {/* Difficulty */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full p-2 border rounded"
          >
            <option value={Difficulty.EASY}>Easy</option>
            <option value={Difficulty.MEDIUM}>Medium</option>
            <option value={Difficulty.HARD}>Hard</option>
          </select>
        </div>

        {/* Task */}
        <div className="mb-4">
          <label htmlFor="task" className="block text-sm font-medium mb-2">Task *</label>
          <input
            type="text"
            id="task"
            placeholder="e.g., Which era does this outfit belong to?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Media References */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Media References *</label>
            <button type="button" onClick={addMediaRef} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Add Media
            </button>
          </div>
          
          {mediaRefs.map((media, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded mb-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Media {index + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => removeMediaRef(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                {media.url ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-700">Image uploaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateMediaRef(index, '')}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={media.url} 
                        alt={`Outfit reference ${index + 1}`}
                        className="w-full max-w-md mx-auto h-auto object-contain bg-gray-50"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <MediaUpload
                    type="image"
                    onUploadSuccess={handleImageUpload(index)}
                    onError={(error) => console.error('Upload error:', error)}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Choices */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Answer Choices *</label>
            <button type="button" onClick={addChoice} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Add Choice
            </button>
          </div>
          
          {choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === index}
                  onChange={() => setCorrectIndex(index)}
                  className="flex-shrink-0"
                />
                <span className="text-sm flex-shrink-0 w-8">{index + 1}.</span>
                <input
                  type="text"
                  placeholder={`Enter choice ${index + 1}`}
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  required
                  className="flex-1 p-2 border rounded"
                />
              </div>
              {choices.length > 2 && (
                <button 
                  type="button" 
                  onClick={() => removeChoice(index)}
                  className="flex-shrink-0 text-red-600 hover:text-red-700 px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <p className="text-sm text-gray-600 mt-2">Select the correct answer (current: choice {correctIndex + 1})</p>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Subjects</label>
            <button type="button" onClick={addSubject} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Add Subject
            </button>
          </div>
          
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                placeholder={`Subject ${index + 1}`}
                value={subject}
                onChange={(e) => updateSubject(index, e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <button 
                type="button" 
                onClick={() => removeSubject(index)}
                className="text-red-600 hover:text-red-700 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Themes */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Themes</label>
            <button type="button" onClick={addTheme} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Add Theme
            </button>
          </div>
          
          {themes.map((theme, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                placeholder={`Theme ${index + 1}`}
                value={theme}
                onChange={(e) => updateTheme(index, e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <button 
                type="button" 
                onClick={() => removeTheme(index)}
                className="text-red-600 hover:text-red-700 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}