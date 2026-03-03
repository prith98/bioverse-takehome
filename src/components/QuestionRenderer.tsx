"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionWithMeta } from "@/lib/types";

interface QuestionRendererProps {
  question: QuestionWithMeta;
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  const { questionJson } = question;

  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-900">{questionJson.question}</p>

      {questionJson.type === "input" ? (
        <Input
          value={value[0] ?? ""}
          onChange={(e) => onChange([e.target.value])}
          placeholder="Your answer"
          className={error ? "border-red-500" : ""}
        />
      ) : (
        <div className="space-y-2">
          {[...(questionJson.options ?? []), "None"].map((option) => {
            const checked = value.includes(option);
            return (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={checked}
                  onCheckedChange={(c) => {
                    if (option === "None") {
                      onChange(c ? ["None"] : []);
                    } else if (c) {
                      onChange([...value.filter((v) => v !== "None"), option]);
                    } else {
                      onChange(value.filter((v) => v !== option));
                    }
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
