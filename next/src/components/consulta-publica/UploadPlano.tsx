"use client";

import { useCallback, useRef, useState } from "react";

/**
 * UploadPlano — Client Component
 *
 * Formulário de upload de plano municipal.
 * Reproduz o fluxo de omlpi-www/src/assets/scripts/plans.js.
 * POST para /api/upload-plan (Route Handler proxy → OMLPI_API_URL/upload_plan).
 *
 * Campos obrigatórios (confirmado em openapi.yaml):
 *   file (PDF), name, message, email
 */

interface FormState {
  file: File | null;
  name: string;
  message: string;
  email: string;
}

interface FieldErrors {
  file?: string;
  name?: string;
  message?: string;
  email?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.file) errors.file = "Selecione um arquivo PDF";
  else if (!form.file.type.includes("pdf"))
    errors.file = "O arquivo deve ser um PDF";
  if (!form.name.trim()) errors.name = "Informe seu nome";
  if (!form.email.trim()) errors.email = "Informe seu e-mail";
  else if (!validateEmail(form.email)) errors.email = "E-mail inválido";
  if (!form.message.trim()) errors.message = "Adicione uma mensagem";
  return errors;
}

export function UploadPlano() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    file: null,
    name: "",
    message: "",
    email: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((f) => ({ ...f, file }));
    if (errors.file) setErrors((e) => ({ ...e, file: undefined }));
  };

  const handleField = (
    field: keyof Omit<FormState, "file">,
    value: string
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const resetForm = useCallback(() => {
    setForm({ file: null, name: "", message: "", email: "" });
    setErrors({});
    setServerError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");
    setServerError("");

    const data = new FormData();
    data.append("file", form.file!);
    data.append("name", form.name);
    data.append("message", form.message);
    data.append("email", form.email);

    try {
      const res = await fetch("/api/upload-plan", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        setStatus("success");
        resetForm();
        // Retorna ao idle após 5s
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        const json = await res.json().catch(() => ({}));
        setServerError(
          (json as { error?: string }).error ||
            "Tivemos um problema no envio. Tente novamente."
        );
        setStatus("error");
      }
    } catch {
      setServerError(
        "Não foi possível conectar ao servidor. Verifique sua conexão."
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-foreground">Plano enviado!</h4>
        <p className="text-sm text-muted-foreground">
          Seu plano foi recebido e será avaliado pela nossa equipe.
        </p>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-label="Formulário de envio de plano municipal"
    >
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Contribua enviando o plano municipal da sua cidade para nossa base de dados.
        </p>
      </div>

      {/* Arquivo */}
      <div className="space-y-1.5">
        <label htmlFor="upload-file" className="text-sm font-medium text-foreground">
          Arquivo do plano (PDF) <span className="text-destructive">*</span>
        </label>
        <div
          className={[
            "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            "hover:border-primary/60 transition-colors",
            errors.file ? "border-destructive" : "border-border",
            form.file ? "border-secondary/60 bg-accent/30" : "",
          ].join(" ")}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="upload-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFile}
            className="sr-only"
            aria-describedby={errors.file ? "upload-file-error" : undefined}
          />
          {form.file ? (
            <div className="space-y-1">
              <svg
                className="w-8 h-8 text-secondary mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <p className="text-sm font-medium text-foreground">{form.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(form.file.size / 1024 / 1024).toFixed(2)} MB — clique para trocar
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <svg
                className="w-8 h-8 text-muted-foreground mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                Clique para selecionar ou arraste o PDF aqui
              </p>
            </div>
          )}
        </div>
        {errors.file && (
          <p id="upload-file-error" className="text-xs text-destructive">
            {errors.file}
          </p>
        )}
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <label htmlFor="upload-name" className="text-sm font-medium text-foreground">
          Seu nome <span className="text-destructive">*</span>
        </label>
        <input
          id="upload-name"
          type="text"
          value={form.name}
          onChange={(e) => handleField("name", e.target.value)}
          disabled={isLoading}
          aria-describedby={errors.name ? "upload-name-error" : undefined}
          className={[
            "w-full px-4 py-2.5 rounded-lg border text-sm bg-input-background",
            "focus:outline-2 focus:outline-ring transition-colors",
            errors.name ? "border-destructive" : "border-border",
          ].join(" ")}
          placeholder="Nome completo"
        />
        {errors.name && (
          <p id="upload-name-error" className="text-xs text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <label htmlFor="upload-email" className="text-sm font-medium text-foreground">
          E-mail <span className="text-destructive">*</span>
        </label>
        <input
          id="upload-email"
          type="email"
          value={form.email}
          onChange={(e) => handleField("email", e.target.value)}
          disabled={isLoading}
          aria-describedby={errors.email ? "upload-email-error" : undefined}
          className={[
            "w-full px-4 py-2.5 rounded-lg border text-sm bg-input-background",
            "focus:outline-2 focus:outline-ring transition-colors",
            errors.email ? "border-destructive" : "border-border",
          ].join(" ")}
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p id="upload-email-error" className="text-xs text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      {/* Mensagem */}
      <div className="space-y-1.5">
        <label
          htmlFor="upload-message"
          className="text-sm font-medium text-foreground"
        >
          Mensagem <span className="text-destructive">*</span>
        </label>
        <textarea
          id="upload-message"
          value={form.message}
          onChange={(e) => handleField("message", e.target.value)}
          disabled={isLoading}
          rows={4}
          aria-describedby={errors.message ? "upload-message-error" : undefined}
          className={[
            "w-full px-4 py-2.5 rounded-lg border text-sm bg-input-background resize-none",
            "focus:outline-2 focus:outline-ring transition-colors",
            errors.message ? "border-destructive" : "border-border",
          ].join(" ")}
          placeholder="Sobre o plano, o município, ou qualquer informação relevante..."
        />
        {errors.message && (
          <p id="upload-message-error" className="text-xs text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      {/* Erro de servidor */}
      {status === "error" && serverError && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={[
          "w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all",
          "focus:outline-2 focus:outline-ring",
          isLoading
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Enviando...
          </span>
        ) : (
          "Enviar plano"
        )}
      </button>
    </form>
  );
}
