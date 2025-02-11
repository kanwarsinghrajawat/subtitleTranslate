"use client";
import React, { useState } from "react";
import { useSubtitleTranslator } from "../hooks/useSubTitleTranslator.ts";
import { MdInsertDriveFile } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ProgressBar from "./Progressbar";
import LanguageSelector from "./LanguageSelecetor";

const InputField: React.FC = () => {
  const {
    selectedFiles,
    selectedLanguages,
    processedTexts,
    progresses,
    handleFileChange,
    handleLanguageChange,
    handleConvert,
    handleDownload,
  } = useSubtitleTranslator();

  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl border border-gray-200">
      <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600 hover:border-blue-500 hover:bg-blue-50 transition">
        <input
          type="file"
          multiple
          accept=".srt,.vtt"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-lg font-medium">Click to Upload Files</p>
      </label>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          {selectedFiles.map((file, fileIndex) => {
            const fileName = file.name;
            const fileLangs = selectedLanguages[fileIndex] || [];
            const isLoading = loadingFile === fileName;

            return (
              <div
                key={fileName}
                className="border border-gray-200 p-5 rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="flex gap-6">
                  <div className="w-64">
                    <div className="flex items-center gap-2 mb-2">
                      <MdInsertDriveFile className="text-gray-500 text-xl" />
                      <p className="font-semibold text-gray-700 text-lg break-words">
                        {fileName}
                      </p>
                    </div>

                    <LanguageSelector
                      selectedLanguages={fileLangs}
                      onLanguageChange={(langs) =>
                        handleLanguageChange(fileIndex, langs)
                      }
                    />
                  </div>

                  <div className="flex w-full flex-col gap-3">
                    {fileLangs.map((lang) => {
                      const langProgress = progresses[fileName]?.[lang] ?? 0;
                      const translatedText =
                        processedTexts[fileName]?.[lang] || "";

                      return (
                        <div
                          key={lang}
                          className="flex items-center gap-3 w-full"
                        >
                          <ProgressBar
                            lang={lang}
                            progress={langProgress}
                            translatedText={translatedText}
                            handleDownload={handleDownload}
                            fileName={fileName}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setLoadingFile(fileName);
                    await handleConvert(file, fileLangs);
                    setLoadingFile(null);
                  }}
                  disabled={fileLangs.length === 0 || isLoading}
                  className="mt-4 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg w-full text-center font-semibold hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin text-white text-lg" />
                      Converting...
                    </>
                  ) : (
                    "Translate"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InputField;
