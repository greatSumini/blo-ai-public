"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button-v2";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

// Factory function for i18n-aware schema
const createGenerationFormSchema = (t: (key: string) => string) =>
  z.object({
    topic: z
      .string()
      .min(2, t("validation.topicMinLength"))
      .max(200, t("validation.topicMaxLength")),
    brandingId: z.string().uuid(t("validation.brandingRequired")),
    keywords: z.array(z.string()).optional(),
    additionalInstructions: z
      .string()
      .max(1000, t("validation.additionalMaxLength"))
      .optional(),
  });

export type GenerationFormData = z.infer<
  ReturnType<typeof createGenerationFormSchema>
>;

interface GenerationFormProps {
  brandings: Array<{ id: string; name: string }>;
  onSubmit: (data: GenerationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function GenerationForm({
  brandings,
  onSubmit,
  isLoading,
}: GenerationFormProps) {
  const t = useTranslations("articles.generationForm");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const GenerationFormSchema = useMemo(
    () => createGenerationFormSchema(t),
    [t]
  );

  const form = useForm<GenerationFormData>({
    resolver: zodResolver(GenerationFormSchema),
    defaultValues: {
      topic: "",
      brandingId: brandings[0]?.id || "",
      keywords: [],
      additionalInstructions: "",
    },
  });

  const handleSubmit = async (data: GenerationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
      <div className="space-y-8">
        {/* Simple Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-medium leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-text-secondary mt-4">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Textarea */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("topicPlaceholder")}
                      disabled={isSubmitting || isLoading}
                      className="min-h-[200px] resize-none border-border-default bg-bg-primary text-text-primary placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 transition-shadow duration-normal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Controls (Style Guide + Generate Button) */}
            <div className="flex items-center gap-3">
              <FormField
                control={form.control}
                name="brandingId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting || isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-border-default bg-bg-primary text-text-primary">
                          <SelectValue placeholder={t("brandingPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brandings.map((guide) => (
                          <SelectItem key={guide.id} value={guide.id}>
                            {guide.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || isLoading || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("generateButton")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
