"use client";
import React from "react";
import { languages } from "../constants";

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageChange: (langs: string[]) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguageChange,
}) => {
  const allSelected = selectedLanguages.length === languages.length;
  const isPartiallySelected =
    selectedLanguages.length > 0 && selectedLanguages.length < languages.length;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const updatedLanguages = checked
      ? [...selectedLanguages, value]
      : selectedLanguages.filter((lang) => lang !== value);

    onLanguageChange(updatedLanguages);
  };

  const handleSelectAll = () => {
    onLanguageChange(allSelected ? [] : languages.map((lang) => lang.code));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-md w-56  overflow-y-auto custom-scrollbar">
      <label className="flex items-center px-2 py-2 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 transition">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = isPartiallySelected;
          }}
          onChange={handleSelectAll}
          className="mr-2 accent-blue-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700">Select All</span>
      </label>
      <div className="mt-2 space-y-1">
        {languages.map((lang) => (
          <label
            key={lang.code}
            className="flex items-center px-2 py-2 rounded cursor-pointer hover:bg-gray-100 transition"
          >
            <input
              type="checkbox"
              value={lang.code}
              checked={selectedLanguages.includes(lang.code)}
              onChange={handleChange}
              className="mr-2 accent-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{lang.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
