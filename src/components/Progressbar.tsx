import { MdInsertDriveFile, MdFileDownload } from "react-icons/md";

const ProgressBar = ({
  lang,
  progress,
  translatedText,
  handleDownload,
  fileName,
}: {
  lang: string;
  progress: number;
  translatedText: string;
  handleDownload: (text: string, filename: string) => void;
  fileName: string;
}) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md w-full">
      <div className="flex items-center gap-3">
        <MdInsertDriveFile className="text-blue-500 text-2xl" />
        <span className="text-sm font-semibold text-gray-800">
          {lang.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center space-x-2 w-full max-w-sm relative">
        <div className="relative w-full bg-gray-300 rounded-full h-2 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-800 w-10">
          {Math.round(progress)}%
        </span>

        {progress === 100 && translatedText && (
          <button
            onClick={() =>
              handleDownload(
                translatedText,
                `translated-${fileName}-${lang}.srt`
              )
            }
            className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            <MdFileDownload className="text-md" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
