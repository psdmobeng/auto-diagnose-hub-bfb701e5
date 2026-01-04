import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MessageCircleQuestion, Search, SkipForward } from "lucide-react";

interface QuestionOption {
  value: string;
  label: string;
}

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

interface ClarifyingQuestionsProps {
  questions: DiagnosticQuestion[];
  answers: Record<string, string>;
  pendingQuery: string;
  onAnswer: (questionId: string, value: string) => void;
  onProceed: () => void;
  onSkip: () => void;
}

export function ClarifyingQuestions({
  questions,
  answers,
  pendingQuery,
  onAnswer,
  onProceed,
  onSkip,
}: ClarifyingQuestionsProps) {
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5 text-primary" />
          Pertanyaan Klarifikasi
        </CardTitle>
        <CardDescription>
          Untuk diagnosa "<span className="font-medium text-foreground">{pendingQuery}</span>" yang lebih akurat, jawab pertanyaan berikut:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="space-y-3">
            <p className="font-medium text-sm">
              {index + 1}. {q.question}
            </p>
            <RadioGroup
              value={answers[q.id] || ""}
              onValueChange={(value) => onAnswer(q.id, value)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {q.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${q.id}-${option.value}`}
                    className="peer"
                  />
                  <Label
                    htmlFor={`${q.id}-${option.value}`}
                    className="flex-1 cursor-pointer rounded-md border border-muted bg-background px-3 py-2 text-sm hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <Button onClick={onProceed} disabled={!allAnswered} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Cari dengan Klarifikasi
          </Button>
          <Button variant="outline" onClick={onSkip}>
            <SkipForward className="h-4 w-4 mr-2" />
            Lewati
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
