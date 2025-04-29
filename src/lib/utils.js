import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Load reviewedResult from localStorage
export const loadReviewedResult = () => {
  try {
    return localStorage.getItem("reviewedResult") || "";
  } catch (error) {
    console.error("Failed to load reviewedResult", error);
    return "";
  }
};

export const loadInputCode = () => {
  try {
    return localStorage.getItem("inputCode") || "";
  } catch (error) {
    console.error("Failed to load inputCode", error);
    return "";
  }
};

export const loadLanguage = () => {
  try {
    return localStorage.getItem("language") || "javascript"; // Default fallback
  } catch (error) {
    console.error("Failed to load language", error);
    return "javascript";
  }
};

export const saveReviewedResult = (result) => {
  localStorage.setItem("reviewedResult", result);
};

export const saveInputCode = (code) => {
  localStorage.setItem("inputCode", code);
};

export const saveLanguage = (language) => {
  localStorage.setItem("language", language);
};

export const clearReviewedResult = () => {
  localStorage.removeItem("reviewedResult");
};

export const clearInputCode = () => {
  localStorage.removeItem("inputCode");
};

export const clearLanguage = () => {
  localStorage.removeItem("language");
};

export const clearAllReviewData = () => {
  try {
    localStorage.removeItem("inputCode");
    localStorage.removeItem("language");
    localStorage.removeItem("reviewedResult");
    localStorage.removeItem("codeReviewHistory");
  } catch (error) {
    console.error("Failed to clear review-related data", error);
  }
};
