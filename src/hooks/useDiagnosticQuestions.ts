import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuestionOption {
  value: string;
  label: string;
}

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

interface UseDiagnosticQuestionsReturn {
  questions: DiagnosticQuestion[];
  answers: Record<string, string>;
  isLoadingQuestions: boolean;
  showQuestions: boolean;
  pendingQuery: string;
  fetchQuestions: (query: string) => Promise<void>;
  setAnswer: (questionId: string, value: string) => void;
  proceedWithSearch: () => string[];
  skipQuestions: () => string[];
  resetQuestions: () => void;
}

export function useDiagnosticQuestions(): UseDiagnosticQuestionsReturn {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");

  const fetchQuestions = async (query: string) => {
    setIsLoadingQuestions(true);
    setPendingQuery(query);
    setAnswers({});
    
    try {
      const { data, error } = await supabase.functions.invoke("diagnostic-questions", {
        body: { userQuery: query },
      });

      if (error) {
        console.error("Error fetching questions:", error);
        toast.error("Gagal mendapatkan pertanyaan klarifikasi");
        setShowQuestions(false);
        return;
      }

      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setShowQuestions(true);
      } else {
        // No questions generated, proceed directly
        setShowQuestions(false);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Terjadi kesalahan saat memproses pertanyaan");
      setShowQuestions(false);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildEnhancedKeywords = (): string[] => {
    // Combine original query with selected answers
    const keywords: string[] = [];
    
    // Add original query words
    pendingQuery.toLowerCase().split(/\s+/).forEach((word) => {
      if (word.length > 2) keywords.push(word);
    });

    // Add answer labels as keywords
    questions.forEach((q) => {
      const selectedValue = answers[q.id];
      if (selectedValue) {
        const selectedOption = q.options.find((opt) => opt.value === selectedValue);
        if (selectedOption) {
          // Add the label words as keywords
          selectedOption.label.toLowerCase().split(/\s+/).forEach((word) => {
            if (word.length > 2 && !keywords.includes(word)) {
              keywords.push(word);
            }
          });
        }
      }
    });

    return keywords;
  };

  const proceedWithSearch = (): string[] => {
    const keywords = buildEnhancedKeywords();
    setShowQuestions(false);
    return keywords;
  };

  const skipQuestions = (): string[] => {
    setShowQuestions(false);
    // Return just the query words
    return pendingQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  };

  const resetQuestions = () => {
    setQuestions([]);
    setAnswers({});
    setShowQuestions(false);
    setPendingQuery("");
  };

  return {
    questions,
    answers,
    isLoadingQuestions,
    showQuestions,
    pendingQuery,
    fetchQuestions,
    setAnswer,
    proceedWithSearch,
    skipQuestions,
    resetQuestions,
  };
}
