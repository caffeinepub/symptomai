import type { AnalysisResult } from "./symptomAnalyzer";

const GEMINI_API_KEY = "AIzaSyC3kme5JkNGiDpb5-ozx1XU_kXVlbVw0cI";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_PRO_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

export interface ImageData {
  base64: string;
  mimeType: string;
}

const MEDICAL_PROMPT = (
  symptoms: string,
  age?: string,
  gender?: string,
  hasImage?: boolean,
) => {
  const patientContext =
    age || gender
      ? `Patient context: ${age ? `Age ${age}` : ""}${age && gender ? ", " : ""}${gender ? `Gender: ${gender}` : ""}.`
      : "";

  const imageNote = hasImage
    ? `A medical report image has been provided (e.g. blood test, CBC, urine report, X-ray, prescription, or clinical photo). 
Read ALL values in the report carefully. Identify any abnormal values (marked as high/low or outside reference ranges). 
Use the report findings as primary clinical data alongside the patient's described symptoms.`
    : "";

  const symptomsSection =
    symptoms &&
    symptoms !==
      "(No text symptoms provided — please analyze the uploaded report image)"
      ? `Patient's described symptoms: "${symptoms}"`
      : hasImage
        ? "The patient has not described additional symptoms — please analyze the uploaded medical report/image directly."
        : `Patient's described symptoms: "${symptoms}"`;

  return `You are a clinical medical AI assistant helping patients understand their health. ${patientContext}

${imageNote}

${symptomsSection}

Carefully analyze the above information and provide a medically accurate assessment.${hasImage ? " Extract specific values from the report, note which are abnormal, and explain what they indicate clinically." : ""}

Return ONLY a valid JSON object with no markdown fences, no extra text, no trailing commas. Exactly this structure:
{"disease":"[primary diagnosis or condition identified from symptoms and/or report findings]","cause":"[2-4 sentences: what the condition is, what causes it, and why these specific symptoms or abnormal values appear]","precautions":"[5 numbered action steps for the patient, each on its own line starting with a number and period. Be specific to the diagnosis.]"}

Rules:
- If a blood/lab report is provided, name the condition derived from abnormal values (e.g. "Microcytic Anemia", "Thalassemia Trait", "Leukocytosis")
- If symptoms clearly match a known condition, name it specifically (e.g. "Asthma", "Chickenpox", "UTI")
- If ambiguous between 2-3 conditions, say "Possible [A] or [B]" and explain the differential
- If completely non-specific, say "Requires Professional Evaluation"
- Always include "Consult a doctor or specialist" as one of the precautions
- For emergencies (chest pain, stroke, severe breathing difficulty), start with "SEEK EMERGENCY CARE IMMEDIATELY"
- Use clear, plain language the patient can understand — avoid overly technical jargon`;
};

async function callGeminiEndpoint(
  url: string,
  symptoms: string,
  age?: string,
  gender?: string,
  imageData?: ImageData,
): Promise<AnalysisResult> {
  const prompt = MEDICAL_PROMPT(symptoms, age, gender, !!imageData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [{ text: prompt }];
  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.base64,
      },
    });
  }

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();

  // Check for blocked/filtered response
  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  if (
    finishReason &&
    finishReason !== "STOP" &&
    finishReason !== "MAX_TOKENS"
  ) {
    // Fallback: try without image if the image caused the block
    if (
      imageData &&
      (finishReason === "SAFETY" ||
        finishReason === "OTHER" ||
        finishReason === "RECITATION")
    ) {
      return callGeminiEndpoint(url, symptoms, age, gender, undefined);
    }
    throw new Error(`Gemini response blocked: ${finishReason}`);
  }

  const text: string = candidate?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    // If no text but we had an image, retry without the image
    if (imageData) {
      return callGeminiEndpoint(url, symptoms, age, gender, undefined);
    }
    throw new Error("Empty response from Gemini");
  }

  let jsonStr = text.trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1];
  }

  const start = jsonStr.indexOf("{");
  const end = jsonStr.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    jsonStr = jsonStr.slice(start, end + 1);
  }

  const parsed = JSON.parse(jsonStr);

  if (!parsed.disease || !parsed.cause || !parsed.precautions) {
    throw new Error("Invalid response structure from Gemini");
  }

  return {
    disease: parsed.disease,
    cause: parsed.cause,
    precautions: parsed.precautions,
  };
}

export async function analyzeWithGemini(
  symptoms: string,
  age?: string,
  gender?: string,
  imageData?: ImageData,
): Promise<AnalysisResult> {
  // For image analysis, try flash first (more permissive with images),
  // then fall back to pro
  if (imageData) {
    try {
      return await callGeminiEndpoint(
        GEMINI_URL,
        symptoms,
        age,
        gender,
        imageData,
      );
    } catch {
      return await callGeminiEndpoint(
        GEMINI_PRO_URL,
        symptoms,
        age,
        gender,
        imageData,
      );
    }
  }
  return callGeminiEndpoint(GEMINI_PRO_URL, symptoms, age, gender, imageData);
}

// Main export: fully powered by Gemini — one retry without image if needed, then surface the error
export async function analyzeSymptomsSmart(
  symptoms: string,
  age?: string,
  gender?: string,
  imageData?: ImageData,
): Promise<AnalysisResult> {
  try {
    return await analyzeWithGemini(symptoms, age, gender, imageData);
  } catch (firstError) {
    // If we had an image and it failed, retry without the image as a last resort
    if (imageData) {
      try {
        return await analyzeWithGemini(symptoms, age, gender, undefined);
      } catch {
        // ignore second error, fall through
      }
    } else {
      // No image — just retry once
      try {
        return await analyzeWithGemini(symptoms, age, gender, undefined);
      } catch {
        // ignore
      }
    }
    console.error("Gemini analysis failed after all retries:", firstError);
    throw new Error(
      "AI analysis is currently unavailable. Please check your connection and try again.",
    );
  }
}
