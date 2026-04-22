"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Share2, Download, Eye, Globe, ArrowLeft, MoreHorizontal, MessageSquare, Heart, Sparkles, FileText, Settings as SettingsIcon, Layout, Palette, Monitor } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings, updateSettings } from "@/lib/store";
import { cn } from "@/lib/utils";
import { db, COLLECTIONS } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { flattenParsedData, sanitizeForFirestore } from "@/lib/firestore-utils";

export default function PreviewPage() {
  const [parsedData, setParsedData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [aiThemeDescription, setAiThemeDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get data from sessionStorage (industry standard for temporary data)
    const data = sessionStorage.getItem("parsedContent");
    if (data) {
      setParsedData(JSON.parse(data));
    }
    
    // Get settings from sessionStorage or use defaults
    const selectedTemplate = sessionStorage.getItem("selectedTemplate") || 'editorial';
    const aiDescription = sessionStorage.getItem("aiThemeDescription") || '';
    
    const templateSettings = getSettings();
    templateSettings.activeTemplate = selectedTemplate;
    
    // If AI theme was selected, apply the description
    if (selectedTemplate === 'custom' && aiDescription) {
      templateSettings.aiThemeDescription = aiDescription;
      setAiThemeDescription(aiDescription);
    }
    
    setSettings(templateSettings);
  }, []);

  const handleUpdateSetting = (updates) => {
    const newSettings = updateSettings(updates);
    setSettings(newSettings);
  };

  if (!parsedData || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No preview available</h2>
        <p className="text-slate-500 mb-8">Please upload a file first to see the forged page.</p>
        <Link href="/upload" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
          Go to Upload
        </Link>
      </div>
    );
  }

  // Template-specific style mapping
  const templateStyles = {
    editorial: {
      container: "max-w-4xl",
      header: "bg-gradient-to-br from-slate-900 to-indigo-900 text-white",
      title: "text-3xl md:text-4xl font-bold italic",
      article: "p-8 md:p-12"
    },
    minimal: {
      container: "max-w-2xl bg-transparent shadow-none border-none",
      header: "bg-transparent border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white",
      title: "text-inherit text-4xl font-light",
      article: "px-0 py-12"
    },
    academic: {
      container: "max-w-5xl rounded-none border-t-8 border-indigo-600 shadow-md",
      header: "bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white",
      title: "text-inherit text-3xl font-serif",
      article: "p-12 md:p-16 columns-1 md:columns-2 gap-12"
    },
    landing: {
      container: "max-w-7xl bg-transparent border-none shadow-none px-0",
      header: "bg-[#024B53] rounded-[32px] md:mx-4 overflow-hidden min-h-[500px] text-white",
      title: "text-white text-4xl md:text-6xl font-black text-left",
      article: "px-4 py-16 bg-white dark:bg-slate-900 mt-8 rounded-[32px] md:mx-4 shadow-xl"
    },
    newsletter: {
      container: "max-w-3xl",
      header: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      title: "text-3xl md:text-4xl font-bold",
      article: "p-8 md:p-12 bg-white dark:bg-slate-900"
    },
    portfolio: {
      container: "max-w-6xl",
      header: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-orange-900/20 text-slate-900 dark:text-white",
      title: "text-4xl md:text-5xl font-black text-slate-900 dark:text-white",
      article: "p-8 md:p-16"
    },
    custom: {
      container: "max-w-4xl",
      header: aiThemeDescription ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-gradient-to-br from-slate-900 to-indigo-900 text-white",
      title: "text-3xl md:text-4xl font-bold",
      article: "p-8 md:p-12"
    }
  };

  const style = templateStyles[settings.activeTemplate] || templateStyles.editorial;

  const handlePublish = async () => {
    // Get values from sessionStorage with proper fallbacks
    const rawSlug = sessionStorage.getItem("urlSlug") || "untitled-" + Math.random().toString(36).substr(2, 5);
    const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, '-');
    const siteName = parsedData.name || slug;

    try {
      const siteRef = doc(db, COLLECTIONS.SITES, slug);

      // Sanitize parsedData to remove undefined values and ensure Firestore compatibility
      const cleanData = flattenParsedData(parsedData);

      // Simplify settings - only keep essential fields
      const cleanSettings = {
        activeTemplate: String(settings?.activeTemplate || 'editorial'),
        theme: {
          titleColor: String(settings?.theme?.titleColor || '#025E68'),
          accentColor: String(settings?.theme?.accentColor || '#FFD700')
        }
      };

      // Add AI theme if present
      if (settings?.activeTemplate === 'custom' && aiThemeDescription) {
        cleanSettings.aiThemeDescription = String(aiThemeDescription);
        cleanSettings.theme.aiGenerated = true;
      }

      const siteData = {
        slug: String(slug),
        siteName: String(siteName),
        data: cleanData,
        settings: cleanSettings,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Debug: Log summary only (not full content to avoid 2.7MB logs!)
      console.log('Publishing to Firebase:', {
        slug: siteData.slug,
        siteName: siteData.siteName,
        dataType: siteData.data.type,
        contentSize: `${(siteData.data.content?.length || 0 / 1024).toFixed(2)} KB`,
        hasRows: siteData.data.rows !== undefined,
        template: siteData.settings.activeTemplate
      });

      await setDoc(siteRef, siteData);

      toast.success(`Site Published to /${slug}!`);
      router.push(`/admin`);
    } catch (error) {
      console.error("Error publishing site:", error);
      console.error("Error details:", error.message);
      toast.error("Cloud publishing failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/upload" 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <span className="font-semibold hidden sm:block truncate max-w-[200px]">
              Previewing: {parsedData.name || sessionStorage.getItem("urlSlug") || 'Untitled'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             <button 
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium whitespace-nowrap",
                showCustomizer ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <SettingsIcon className={cn("w-4 h-4", showCustomizer && "animate-spin-slow")} />
              <span>{showCustomizer ? "Close Designer" : "Design Options"}</span>
            </button>
            <button 
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all font-medium whitespace-nowrap shadow-lg shadow-indigo-500/20"
            >
              <Globe className="w-4 h-4" />
              <span>Publish Site</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Preview Area */}
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-500 p-4 md:p-12",
          showCustomizer ? "md:mr-96" : "mr-0"
        )}>
          <motion.article 
            key={settings.activeTemplate}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              fontFamily: settings.theme.fontPrimary,
              '--title-color': settings.theme.titleColor,
              '--primary-color': settings.theme.primaryColor,
            }}
            className={cn(
              "mx-auto bg-white dark:bg-slate-900 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl",
              style.container
            )}
          >
            {/* Dynamic Header */}
            <div className={cn("w-full py-20 px-8 flex flex-col md:flex-row items-center justify-between text-left relative overflow-hidden", style.header)}>
              {settings.activeTemplate === 'landing' ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#024B53] to-[#01353b]" />
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  
                  <div className="z-10 max-w-xl">
                    <div className="inline-block px-4 py-1.5 bg-[#FFD700] text-[#024B53] rounded-lg text-xs font-black uppercase tracking-widest mb-6">
                      Premium Selection
                    </div>
                    <h1 className={cn("drop-shadow-sm mb-6 leading-tight", style.title)} style={{ color: 'white' }}>
                      {parsedData.metadata.title || parsedData.name}
                    </h1>
                    <p className="text-white/80 text-lg mb-8 max-w-md">
                      Professional AI-driven content transformation for the modern web.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button className="px-8 py-4 bg-white text-[#024B53] rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/20">
                        Get Started
                      </button>
                      <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                        Learn More
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {settings.activeTemplate === 'editorial' && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  )}
                  <div className="z-10 text-center md:text-left w-full">
                    <h1 className={cn("drop-shadow-sm mb-4 leading-tight", style.title)} style={{ color: settings.theme.titleColor }}>
                      {parsedData.metadata.title || parsedData.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="h-px w-8 bg-current opacity-30" />
                      <p className="opacity-60 text-xs font-bold uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="h-px w-8 bg-current opacity-30" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={cn("prose dark:prose-invert max-w-none transition-all duration-500", style.article)}>
              <div 
                className="parsed-content overflow-x-auto leading-relaxed text-slate-700 dark:text-slate-300"
                style={{ fontSize: settings.theme.paragraphSizeDesktop + 'px' }}
                dangerouslySetInnerHTML={{ __html: parsedData.content }} 
              />
              
              <hr className="my-12 border-slate-200 dark:border-slate-800" />
              
              <div className="flex items-center justify-between not-prose opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 italic">Forged by PageForge AI</p>
              </div>
            </div>
          </motion.article>
        </main>

        {/* Floating Customizer Sidebar */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 overflow-y-auto"
            >
              <div className="p-8 space-y-10 pb-20">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Switch Template
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['editorial', 'minimal', 'academic', 'landing'].map(tmpl => (
                      <button
                        key={tmpl}
                        onClick={() => handleUpdateSetting({ activeTemplate: tmpl })}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-tighter",
                          settings.activeTemplate === tmpl ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                        )}
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color Tokens
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">Heading Color</label>
                      <input 
                        type="color" 
                        value={settings.theme.titleColor}
                        onChange={(e) => handleUpdateSetting({ theme: { ...settings.theme, titleColor: e.target.value } })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">Primary Brand</label>
                      <input 
                        type="color" 
                        value={settings.theme.primaryColor}
                        onChange={(e) => handleUpdateSetting({ theme: { ...settings.theme, primaryColor: e.target.value } })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Typography Specs
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold">Paragraph Size</label>
                        <span className="text-[10px] font-mono text-indigo-500">{settings.theme.paragraphSizeDesktop}px</span>
                      </div>
                      <input 
                        type="range" min="12" max="24" step="1"
                        value={settings.theme.paragraphSizeDesktop}
                        onChange={(e) => handleUpdateSetting({ theme: { ...settings.theme, paragraphSizeDesktop: parseInt(e.target.value) } })}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-3 block">Primary Font</label>
                      <select 
                        value={settings.theme.fontPrimary}
                        onChange={(e) => handleUpdateSetting({ theme: { ...settings.theme, fontPrimary: e.target.value } })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm"
                      >
                        <option value="Outfit">Outfit (Modern)</option>
                        <option value="Inter">Inter (Clean)</option>
                        <option value="Playfair Display">Playfair (Serif)</option>
                        <option value="Roboto Mono">Roboto Mono (Tech)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => {
                        toast.success("Design parameters locked!");
                        setShowCustomizer(false);
                    }}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all text-sm mb-4"
                  >
                    Apply & Save
                  </button>
                  <p className="text-[10px] text-center text-slate-400 px-4">
                    Changes are saved automatically to your local design tokens.
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto+Mono&display=swap');
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left text-slate-700 dark:text-slate-300"
    >
      <Icon className="w-4 h-4 text-indigo-500" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
