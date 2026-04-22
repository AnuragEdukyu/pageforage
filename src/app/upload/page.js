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
  const [urlSlug, setUrlSlug] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('editorial');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [aiThemeDescription, setAiThemeDescription] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
        // Store parsed data and show template picker while "processing"
        setParsedData(result.data);
        setShowTemplatePicker(true);
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 10;
          });
        }, 200);
        toast.success("File parsed successfully!");
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

  const handleContinue = async () => {
    if (!parsedData) return;
    
    // Store data in sessionStorage for the preview page
    sessionStorage.setItem("parsedContent", JSON.stringify(parsedData));
    sessionStorage.setItem("urlSlug", urlSlug || parsedData.name.toLowerCase().replace(/\s+/g, '-'));
    sessionStorage.setItem("selectedTemplate", selectedTemplate);
    
    // If AI theme was selected, store the theme description
    if (selectedTemplate === 'custom' && aiThemeDescription) {
      sessionStorage.setItem("aiThemeDescription", aiThemeDescription);
    }
    
    // Navigate to preview page
    router.push("/preview");
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

            <div className="mt-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">yourdomain.com/</span>
                  <input 
                    type="text" 
                    placeholder="my-portfolio" 
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-32 pr-4 py-3 outline-none focus:ring-2 ring-indigo-500/50"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">This will be your page URL: yourdomain.com/{urlSlug || 'my-portfolio'}</p>
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

      {/* Enhanced Template Picker Modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
                    <p className="text-slate-600 dark:text-slate-400">Select a template that best fits your content</p>
                  </div>
                  <button
                    onClick={() => setShowTemplatePicker(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Upload Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                    <span>Processing your file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {!showAIBuilder ? (
                  <div className="space-y-8">
                    {/* Template Grid */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Popular Templates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { 
                            id: 'editorial', 
                            name: 'Editorial', 
                            description: 'Perfect for articles and publications',
                            preview: 'bg-gradient-to-br from-slate-900 to-indigo-900 text-white',
                            img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=300&auto=format&fit=crop'
                          },
                          { 
                            id: 'minimal', 
                            name: 'Minimal', 
                            description: 'Clean and simple design',
                            preview: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
                            img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=300&auto=format&fit=crop'
                          },
                          { 
                            id: 'academic', 
                            name: 'Academic', 
                            description: 'Professional and scholarly layout',
                            preview: 'bg-slate-50 dark:bg-slate-800/50 border-t-8 border-indigo-600',
                            img: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=300&auto=format&fit=crop'
                          },
                          { 
                            id: 'landing', 
                            name: 'Landing', 
                            description: 'High-conversion marketing page',
                            preview: 'bg-[#024B53] text-white rounded-2xl',
                            img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&auto=format&fit=crop'
                          },
                          { 
                            id: 'newsletter', 
                            name: 'Newsletter', 
                            description: 'Email-friendly layout',
                            preview: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
                            img: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=300&auto=format&fit=crop'
                          },
                          { 
                            id: 'portfolio', 
                            name: 'Portfolio', 
                            description: 'Showcase your work beautifully',
                            preview: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-orange-900/20',
                            img: 'https://images.unsplash.com/photo-1559028006-848e2e8f5d15?q=80&w=300&auto=format&fit=crop'
                          },
                        ].map((tmpl) => (
                          <button
                            key={tmpl.id}
                            onClick={() => setSelectedTemplate(tmpl.id)}
                            className={cn(
                              "group text-left transition-all duration-200",
                              selectedTemplate === tmpl.id 
                                ? "scale-105" 
                                : "hover:scale-102"
                            )}
                          >
                            <div className={cn(
                              "rounded-xl overflow-hidden border-2 transition-all h-48 relative",
                              selectedTemplate === tmpl.id 
                                ? "border-indigo-600 ring-2 ring-indigo-600/20" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                            )}>
                              <img src={tmpl.img} className="w-full h-full object-cover" />
                              <div className={cn(
                                "absolute inset-0 flex items-end p-4",
                                tmpl.preview
                              )}>
                                <div className="text-white">
                                  <h4 className="font-bold text-lg">{tmpl.name}</h4>
                                  <p className="text-sm opacity-90">{tmpl.description}</p>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Builder Option */}
                    <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Don't see a template you like?
                      </p>
                      <button
                        onClick={() => setShowAIBuilder(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Sparkles className="w-5 h-5" />
                        Build with AI Instead
                      </button>
                    </div>
                  </div>
                ) : (
                  /* AI Theme Builder */
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">AI Theme Builder</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Describe your ideal design in natural language
                      </p>
                      
                      <textarea
                        value={aiThemeDescription}
                        onChange={(e) => setAiThemeDescription(e.target.value)}
                        placeholder="e.g., 'A modern tech website with dark theme, neon accents, and bold typography' or 'A clean medical site with calming blues and professional layout'..."
                        className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 resize-none outline-none focus:ring-2 ring-indigo-500/50"
                      />
                    </div>

                    {/* Live AI Preview */}
                    {aiThemeDescription && (
                      <div>
                        <h4 className="font-medium mb-3">Live Preview</h4>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                          <div className="space-y-4">
                            <div className="h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowAIBuilder(false)}
                        className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                      >
                        Back to Templates
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate('custom');
                          handleContinue();
                        }}
                        disabled={!aiThemeDescription}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Use AI Theme
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              {!showAIBuilder && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                  >
                    Continue with {selectedTemplate === 'custom' ? 'AI Theme' : selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
