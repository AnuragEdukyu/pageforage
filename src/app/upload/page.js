"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

import { parseFileAction } from "../actions/parseFile";

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9),
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      
      const result = await parseFileAction(formData);
      
      if (result.success) {
        // Save parsed data to localStorage for the preview page
        localStorage.setItem("parsedContent", JSON.stringify(result.data));
        toast.success("File parsed successfully!");
        router.push("/processing");
      } else {
        toast.error("Failed to parse file: " + result.error);
        setIsUploading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 md:py-24">
      <div className="mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Upload your manuscript</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Drop your markdown or PDF file here. We'll handle the rest.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] cursor-pointer",
          isDragActive 
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.01]" 
            : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
          <Upload className="w-10 h-10" />
        </div>
        <p className="text-xl font-medium mb-2 text-center">
          {isDragActive ? "Drop the file here" : "Drag and drop your file"}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Accepts .md and .pdf files (Max 10MB)
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-12 space-y-4"
          >
            <h2 className="text-xl font-semibold mb-4">Selected File</h2>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px] md:max-w-md">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Site Name</label>
                <input 
                  type="text" 
                  placeholder="My Portfolio" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/50"
                  onChange={(e) => localStorage.setItem("pendingSiteName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                  <input 
                    type="text" 
                    placeholder="my-site" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 ring-indigo-500/50"
                    onChange={(e) => localStorage.setItem("pendingSlug", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Design Template</h3>
                <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Change Selection
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm">Modern Editorial (Default)</p>
                  <p className="text-xs text-slate-500">Optimized for premium documents</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={isUploading}
              className="w-full mt-6 py-4 bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-semibold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <span>Forge My Page</span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
