"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateKeyword } from "@/features/keywords/hooks/useKeywordQuery";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface KeywordCreateDialogProps {
  children?: React.ReactNode;
}

export function KeywordCreateDialog({ children }: KeywordCreateDialogProps) {
  const t = useTranslations("keywords");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateKeyword();

  const formSchema = z.object({
    phrase: z
      .string()
      .min(1, t("create.validation.required"))
      .max(100, t("create.validation.maxLength")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phrase: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values.phrase);
      toast({
        title: t("create.toast.successTitle"),
        description: t("create.toast.successDescription", { phrase: values.phrase }),
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        t("create.toast.errorFallback");
      toast({
        title: t("create.toast.errorTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("create.trigger")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
          <DialogDescription>
            {t("create.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("create.fieldLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("create.fieldPlaceholder")}
                      disabled={createMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                {t("create.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t("create.saving") : t("create.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
