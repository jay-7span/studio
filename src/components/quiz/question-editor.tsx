'use client';

import type { Question, AnswerOption, QuestionType } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, PlusCircle, Lightbulb, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAIHintsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface QuestionEditorProps {
  question: Question;
  onQuestionChange: (updatedQuestion: Question) => void;
  onRemoveQuestion: (questionId: string) => void;
  index: number;
}

export function QuestionEditor({ question, onQuestionChange, onRemoveQuestion, index }: QuestionEditorProps) {
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof Question, value: any) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleOptionChange = (optionId: string, text: string) => {
    const updatedOptions = question.options?.map(opt =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    onQuestionChange({ ...question, options: updatedOptions });
  };

  const handleCorrectOptionToggle = (optionId: string, questionType: QuestionType) => {
    let updatedOptions: AnswerOption[] | undefined;
    if (questionType === 'multiple-choice') {
       updatedOptions = question.options?.map(opt =>
        opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
      );
    } else { // Single choice for MCQ (can be adapted for multiple correct later)
       updatedOptions = question.options?.map(opt =>
        opt.id === optionId ? { ...opt, isCorrect: true } : { ...opt, isCorrect: false }
      );
    }
    onQuestionChange({ ...question, options: updatedOptions });
  };
  
  const addOption = () => {
    const newOption: AnswerOption = { id: Date.now().toString(), text: '', isCorrect: false };
    const updatedOptions = [...(question.options || []), newOption];
    onQuestionChange({ ...question, options: updatedOptions });
  };

  const removeOption = (optionId: string) => {
    const updatedOptions = question.options?.filter(opt => opt.id !== optionId);
    onQuestionChange({ ...question, options: updatedOptions });
  };

  const handleGenerateHint = async () => {
    if (!question.text.trim()) {
      toast({ title: "Error", description: "Please enter question text before generating a hint.", variant: "destructive" });
      return;
    }
    setIsLoadingHint(true);
    try {
      const result = await getAIHintsAction({ questions: [question.text] });
      if (result.error) {
        toast({ title: "Hint Generation Failed", description: result.error, variant: "destructive" });
      } else if (result.hints && result.hints.length > 0) {
        handleInputChange('hint', result.hints[0]);
        toast({ title: "Hint Generated", description: "AI hint has been added." });
      } else {
        toast({ title: "Hint Generation Failed", description: "No hint was returned.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hint Generation Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoadingHint(false);
    }
  };
  
  // Initialize options if type is multiple-choice and options are undefined
  useEffect(() => {
    if (question.type === 'multiple-choice' && !question.options) {
      onQuestionChange({ ...question, options: [{ id: Date.now().toString(), text: '', isCorrect: false }] });
    }
  }, [question.type, question.options, onQuestionChange, question]);


  return (
    <div className="p-6 border rounded-lg shadow-md space-y-6 bg-card">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-primary">Question {index + 1}</h3>
        <Button variant="ghost" size="icon" onClick={() => onRemoveQuestion(question.id)} aria-label="Remove question">
          <X className="h-5 w-5 text-destructive" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`question-type-${question.id}`} className="text-base">Question Type</Label>
        <Select
          value={question.type}
          onValueChange={(value) => {
            const newType = value as QuestionType;
            const updatedQuestion = { ...question, type: newType, options: newType === 'multiple-choice' ? (question.options || [{ id: Date.now().toString(), text: '', isCorrect: false }]) : undefined, correctAnswer: ''};
            onQuestionChange(updatedQuestion);
          }}
        >
          <SelectTrigger id={`question-type-${question.id}`} className="w-full">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
            <SelectItem value="true-false">True/False</SelectItem>
            <SelectItem value="short-answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`question-text-${question.id}`} className="text-base">Question Text</Label>
        <Textarea
          id={`question-text-${question.id}`}
          placeholder="Enter your question here..."
          value={question.text}
          onChange={(e) => handleInputChange('text', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-4">
          <Label className="text-base">Options (select correct answer/s)</Label>
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-center space-x-3">
              <Checkbox
                id={`option-correct-${option.id}`}
                checked={option.isCorrect}
                onCheckedChange={() => handleCorrectOptionToggle(option.id, 'multiple-choice')}
              />
              <Input
                type="text"
                placeholder={`Option ${optIndex + 1}`}
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                className="flex-grow"
              />
              {question.options && question.options.length > 1 && (
                 <Button variant="ghost" size="icon" onClick={() => removeOption(option.id)} aria-label="Remove option">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
          </Button>
        </div>
      )}

      {question.type === 'true-false' && (
        <div className="space-y-2">
          <Label className="text-base">Correct Answer</Label>
          <RadioGroup
            value={question.correctAnswer}
            onValueChange={(value) => handleInputChange('correctAnswer', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`true-${question.id}`} />
              <Label htmlFor={`true-${question.id}`} className="font-normal">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`false-${question.id}`} />
              <Label htmlFor={`false-${question.id}`} className="font-normal">False</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {question.type === 'short-answer' && (
        <div className="space-y-2">
          <Label htmlFor={`short-answer-${question.id}`} className="text-base">Correct Answer</Label>
          <Input
            id={`short-answer-${question.id}`}
            placeholder="Enter the correct answer (case-sensitive)"
            value={question.correctAnswer || ''}
            onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
          />
           <p className="text-xs text-muted-foreground">For short answers, matching is typically case-sensitive. You can provide variations if needed, or process answers more flexibly on the backend.</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`question-hint-${question.id}`} className="text-base">Hint (Optional)</Label>
        <div className="flex items-center space-x-2">
            <Textarea
              id={`question-hint-${question.id}`}
              placeholder="Enter a hint for this question or generate one with AI..."
              value={question.hint || ''}
              onChange={(e) => handleInputChange('hint', e.target.value)}
              className="min-h-[60px] flex-grow"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleGenerateHint} 
              disabled={isLoadingHint || !question.text.trim()}
              aria-label="Generate AI Hint"
            >
              {isLoadingHint ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lightbulb className="h-5 w-5 text-accent" />}
            </Button>
        </div>
      </div>
    </div>
  );
}
