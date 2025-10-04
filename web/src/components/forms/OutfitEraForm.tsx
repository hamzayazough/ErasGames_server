import { useState } from 'react';
import { OutfitEraQuestion } from '@/lib/types/interfaces/questions/outfit-era.interface';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import MediaUpload from '@/components/ui/MediaUpload';

interface OutfitEraFormProps {
  onSubmit: (question: OutfitEraQuestion) => void;
  isSubmitting: boolean;
}

export default function OutfitEraForm({ onSubmit, isSubmitting }: OutfitEraFormProps) {
  const [task, setTask] = useState('');
  const [mediaRefs, setMediaRefs] = useState<{ url: string; alt: string }[]>([]);
  const [choices, setChoices] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const addMediaRef = () => {
    setMediaRefs([...mediaRefs, { url: '', alt: '' }]);
  };

  const updateMediaRef = (index: number, field: 'url' | 'alt', value: string) => {
    const newMediaRefs = [...mediaRefs];
    newMediaRefs[index] = { ...newMediaRefs[index], [field]: value };
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
    updateMediaRef(mediaIndex, 'url', uploadData.url);
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

    // Create the question object with string choices
    const question: OutfitEraQuestion = {
      id: crypto.randomUUID(),
      questionType: 'outfit-era',
      prompt: {
        task: task.trim()
      },
      mediaRefs: mediaRefs.filter(media => media.url.trim()),
      choices: choices.filter(choice => choice.trim()),
      correct: {
        index: correctIndex
      },
      difficulty,
      subjects: subjects.filter(s => s.trim()).length > 0 ? subjects.filter(s => s.trim()) : undefined,
      themes: themes.filter(t => t.trim()).length > 0 ? themes.filter(t => t.trim()) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(question);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <Text variant="h3" className="mb-4">Create Outfit Era Question</Text>
        
        {/* Task */}
        <div className="space-y-2">
          <Label htmlFor="task">Task *</Label>
          <Input
            id="task"
            placeholder="e.g., Which outfit represents the 1920s flapper era?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          />
        </div>

        {/* Media References */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Media References *</Label>
            <Button type="button" onClick={addMediaRef} variant="outline" size="sm">
              Add Media
            </Button>
          </div>
          
          {mediaRefs.map((media, index) => (
            <Card key={index} className="p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Text variant="body" className="font-medium">Media {index + 1}</Text>
                  <Button 
                    type="button" 
                    onClick={() => removeMediaRef(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                
                <MediaUpload
                  onUpload={handleImageUpload(index)}
                  onError={(error) => console.error('Upload error:', error)}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
                
                {media.url && (
                  <div>
                    <Label>Current URL:</Label>
                    <Text variant="body" className="text-sm text-gray-600 break-all">{media.url}</Text>
                  </div>
                )}
                
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    placeholder="Descriptive text for the image"
                    value={media.alt}
                    onChange={(e) => updateMediaRef(index, 'alt', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Choices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Answer Choices *</Label>
            <Button type="button" onClick={addChoice} variant="outline" size="sm">
              Add Choice
            </Button>
          </div>
          
          {choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === index}
                  onChange={() => setCorrectIndex(index)}
                  className="flex-shrink-0"
                />
                <Label className="text-sm flex-shrink-0">Choice {index + 1}:</Label>
                <Input
                  placeholder={`Enter choice ${index + 1}`}
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
              {choices.length > 2 && (
                <Button 
                  type="button" 
                  onClick={() => removeChoice(index)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Subjects (Optional)</Label>
            <Button type="button" onClick={addSubject} variant="outline" size="sm">
              Add Subject
            </Button>
          </div>
          
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                placeholder={`Subject ${index + 1}`}
                value={subject}
                onChange={(e) => updateSubject(index, e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={() => removeSubject(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Themes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Themes (Optional)</Label>
            <Button type="button" onClick={addTheme} variant="outline" size="sm">
              Add Theme
            </Button>
          </div>
          
          {themes.map((theme, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                placeholder={`Theme ${index + 1}`}
                value={theme}
                onChange={(e) => updateTheme(index, e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={() => removeTheme(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="px-8"
        >
          {isSubmitting ? 'Creating...' : 'Create Question'}
        </Button>
      </div>
    </form>
  );
}