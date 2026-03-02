"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import QuestionRenderer from "@/components/QuestionRenderer";
import type { QuestionnaireWithQuestions } from "@/lib/types";

interface QuestionnaireFormProps {
  questionnaire: QuestionnaireWithQuestions;
}

export default function QuestionnaireForm({
  questionnaire,
}: QuestionnaireFormProps) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<number, string[]>>(() => {
    const initial: Record<number, string[]> = {};
    for (const q of questionnaire.questions) {
      initial[q.id] = q.existingAnswer ?? [];
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors: Record<number, string> = {};
    for (const q of questionnaire.questions) {
      const val = answers[q.id] ?? [];
      if (val.length === 0) {
        newErrors[q.id] = "This field is required.";
      } else if (q.questionJson.type === "input") {
        if (!val[0] || val[0].trim().length === 0) {
          newErrors[q.id] = "Answer cannot be empty or whitespace.";
        }
      }
    }
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const payload = {
      questionnaireId: questionnaire.id,
      answers: questionnaire.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id],
      })),
    };

    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.ok) {
      router.push("/questionnaires");
    } else {
      const data = await res.json();
      alert(data.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="space-y-8">
      {questionnaire.questions.map((q, index) => (
        <div key={q.id} className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Question {index + 1} of {questionnaire.questions.length}
          </p>
          <QuestionRenderer
            question={q}
            value={answers[q.id] ?? []}
            onChange={(val) => {
              setAnswers((prev) => ({ ...prev, [q.id]: val }));
              if (errors[q.id]) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next[q.id];
                  return next;
                });
              }
            }}
            error={errors[q.id]}
          />
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? "Submitting…" : "Complete Questionnaire"}
      </Button>
    </div>
  );
}
