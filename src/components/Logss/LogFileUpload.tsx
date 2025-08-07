import { useState } from "react";
import axios from "axios";

export function LogFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("logfile", file);

    try {
      setUploadProgress(0);
      setStatus("Uploading…");

      const res = await axios.post("/api/logs/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
          );
          setUploadProgress(percent);
        },
      });

      setStatus(
        `Upload complete: ${res.data.indexed} logs indexed successfully`
      );
    } catch (err: any) {
      setStatus(`Upload failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="file"
        accept=".json,.csv"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setStatus("");
        }}
      />

      {/* Display selected file name */}
      {file && (
        <p className="text-sm text-white">
          Selected: <strong>{file.name}</strong>
        </p>
      )}

      {/* Progress bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-white rounded h-2">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Status / confirmation */}
      {status && <p className="text-sm text-white">{status}</p>}

      <button
        type="submit"
        disabled={!file}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload Logs
      </button>
    </form>
  );
}
