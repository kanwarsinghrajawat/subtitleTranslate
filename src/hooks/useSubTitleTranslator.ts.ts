"use client";
import { useState, ChangeEvent } from "react";

interface ResponseData {
  translated_text: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const CHUNK_SIZE = 5;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

export const useSubtitleTranslator = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[][]>([]);
  const [processedTexts, setProcessedTexts] = useState<
    Record<string, Record<string, string>>
  >({});
  const [progresses, setProgresses] = useState<
    Record<string, Record<string, number>>
  >({});

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setSelectedFiles(filesArray);
    setSelectedLanguages(filesArray.map(() => []));
  };

  const handleLanguageChange = (index: number, newLanguages: string[]) => {
    setSelectedLanguages((prev) => {
      const updated = [...prev];
      updated[index] = newLanguages;
      return updated;
    });
  };

  const fetchWithRetry = async (
    payload: object,
    retries = MAX_RETRIES
  ): Promise<ResponseData> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (attempt < retries) {
          console.warn(`Retrying (${attempt + 1}/${retries})...`, error);
          await new Promise((res) =>
            setTimeout(res, RETRY_DELAY * (attempt + 1))
          );
        } else {
          throw new Error("Max retries reached. Translation failed.");
        }
      }
    }
    throw new Error("Unexpected error in fetchWithRetry.");
  };

  const parseSubtitles = (content: string) => {
    const lines = content.split(/\r?\n/);
    const entries: { index: number; time: string; text: string }[] = [];

    let index = 0,
      time = "",
      text = "";
    for (const line of lines) {
      if (!isNaN(Number(line))) {
        if (index) entries.push({ index, time, text: text.trim() });
        index = Number(line);
        time = "";
        text = "";
      } else if (line.includes("-->")) {
        time = line;
      } else {
        text += (text ? " " : "") + line;
      }
    }
    if (index) entries.push({ index, time, text: text.trim() });

    return entries;
  };

  const chunkSubtitles = (
    entries: { index: number; time: string; text: string }[]
  ) => {
    const chunks: { index: number; time: string; text: string }[][] = [];
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      chunks.push(entries.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  };

  const handleConvert = async (file: File, targetLanguages: string[]) => {
    if (!targetLanguages.length) return;

    try {
      const fileText = await file.text();
      const subtitleEntries = parseSubtitles(fileText);
      const subtitleChunks = chunkSubtitles(subtitleEntries);

      setProgresses((prev) => ({ ...prev, [file.name]: {} }));

      for (const lang of targetLanguages) {
        setProgresses((prev) => ({
          ...prev,
          [file.name]: { ...prev[file.name], [lang]: 0 },
        }));

        const translatedChunks: string[] = [];
        for (let i = 0; i < subtitleChunks.length; i++) {
          const chunk = subtitleChunks[i];
          try {
            const { translated_text } = await fetchWithRetry({
              target_language: lang,
              text: chunk.map((entry) => entry.text).join("\n\n"),
            });

            translatedChunks.push(translated_text);
            setProgresses((prev) => ({
              ...prev,
              [file.name]: {
                ...prev[file.name],
                [lang]: Math.round(((i + 1) / subtitleChunks.length) * 100),
              },
            }));
          } catch (error) {
            console.error(`Translation failed for ${lang}:`, error);
          }
        }

        const finalTranslatedText = subtitleChunks
          .flatMap((chunk, i) =>
            chunk.map(
              (entry, j) =>
                `${entry.index}\n${entry.time}\n${
                  translatedChunks[i]?.split("\n\n")[j] ?? entry.text
                }\n`
            )
          )
          .join("\n");

        setProcessedTexts((prev) => ({
          ...prev,
          [file.name]: { ...prev[file.name], [lang]: finalTranslatedText },
        }));

        setProgresses((prev) => ({
          ...prev,
          [file.name]: { ...prev[file.name], [lang]: 100 },
        }));
      }
    } catch (error) {
      console.error("handleConvert error:", error);
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  };

  return {
    selectedFiles,
    selectedLanguages,
    processedTexts,
    progresses,
    handleFileChange,
    handleLanguageChange,
    handleConvert,
    handleDownload,
  };
};
