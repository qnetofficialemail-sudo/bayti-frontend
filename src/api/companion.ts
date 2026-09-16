// Client for the local Bayti Social Companion app (Electron + Playwright,
// runs on the admin's own machine at http://localhost:47821). See
// C:\Users\Dell\Desktop\bayti-social for the companion app itself.
import axios from "axios";

const companion = axios.create({
  baseURL: "http://localhost:47821",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export type CompanionJobState =
  | "ready" | "gemini_opened" | "prompt_inserted" | "logo_attached"
  | "ready_to_generate" | "generate_clicked" | "generating" | "image_downloaded"
  | "buffer_opened" | "draft_created" | "done" | "failed" | "cancelled";

export interface CompanionJob {
  id: string;
  caption: string;
  lang: "ar" | "en";
  contentType: string;
  dryRun: boolean;
  state: CompanionJobState;
  error: { stage: string; message: string } | null;
  imagePath?: string | null;
  draftRef?: { createdAt: string } | null;
  dryRunStoppedBeforeBuffer?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionJobPayload {
  caption: string;
  lang: "ar" | "en";
  contentType: string;
  dryRun?: boolean;
}

function companionErrorMessage(err: any, isArabic: boolean): string {
  if (err?.code === "ECONNABORTED" || err?.message === "Network Error" || !err?.response) {
    return isArabic
      ? "تعذر الوصول لتطبيق Bayti Social Companion — تأكد إنه شغّال على جهازك"
      : "Could not reach Bayti Social Companion — make sure it's running on your machine";
  }
  return err.response?.data?.error || err.message || (isArabic ? "خطأ غير متوقع" : "Unexpected error");
}

export async function checkCompanionHealth(): Promise<boolean> {
  try {
    const res = await companion.get("/health");
    return !!res.data?.ok;
  } catch {
    return false;
  }
}

export async function startCompanionJob(
  payload: CompanionJobPayload,
  isArabic: boolean
): Promise<{ jobId: string; state: CompanionJobState; duplicate: boolean }> {
  try {
    const res = await companion.post("/job/start", payload);
    return res.data;
  } catch (err) {
    throw new Error(companionErrorMessage(err, isArabic));
  }
}

export async function getCompanionJobStatus(jobId: string, isArabic: boolean): Promise<CompanionJob> {
  try {
    const res = await companion.get(`/job/${jobId}/status`);
    return res.data;
  } catch (err) {
    throw new Error(companionErrorMessage(err, isArabic));
  }
}

export async function cancelCompanionJob(jobId: string, isArabic: boolean): Promise<boolean> {
  try {
    const res = await companion.post(`/job/${jobId}/cancel`);
    return !!res.data?.cancelled;
  } catch (err) {
    throw new Error(companionErrorMessage(err, isArabic));
  }
}

export async function retryCompanionJob(
  jobId: string,
  isArabic: boolean
): Promise<{ jobId: string; state: CompanionJobState }> {
  try {
    const res = await companion.post(`/job/${jobId}/retry`);
    return res.data;
  } catch (err) {
    throw new Error(companionErrorMessage(err, isArabic));
  }
}

export async function previewCompanionPrompt(
  payload: { caption: string; lang: "ar" | "en"; contentType: string },
  isArabic: boolean
): Promise<string> {
  try {
    const res = await companion.post("/prompt/preview", payload);
    return res.data.prompt;
  } catch (err) {
    throw new Error(companionErrorMessage(err, isArabic));
  }
}
