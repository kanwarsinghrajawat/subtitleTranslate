"use client";
import InputField from "@/components/InputField";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Convert Subtitles
        </h1>
        <InputField />
      </div>
    </div>
  );
}
