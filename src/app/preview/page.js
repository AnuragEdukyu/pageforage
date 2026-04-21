"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Share2, Download, Eye, Globe, ArrowLeft, MoreHorizontal, MessageSquare, Heart, Sparkles, FileText, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
  const [parsedData, setParsedData] = useState(null);
  const [settings, setSettings] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("parsedContent");
    if (data) {
      setParsedData(JSON.parse(data));
    }
    setSettings(getSettings());
  }, []);

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
      header: "bg-gradient-to-br from-slate-900 to-indigo-900",
      title: "text-3xl md:text-4xl font-bold italic",
      article: "p-8 md:p-12"
    },
    minimal: {
      container: "max-w-2xl bg-transparent shadow-none border-none",
      header: "bg-transparent border-b border-slate-200 dark:border-slate-800",
      title: "text-white dark:text-white text-4xl font-light",
      article: "px-0 py-12"
    },
    academic: {
      container: "max-w-5xl rounded-none border-t-8 border-indigo-600 shadow-md",
      header: "bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800",
      title: "text-slate-900 dark:text-white text-3xl font-serif",
      article: "p-12 md:p-16 columns-1 md:columns-2 gap-12"
    },
    landing: {
      container: "max-w-7xl bg-transparent border-none shadow-none px-0",
      header: "bg-[#024B53] rounded-[32px] md:mx-4 overflow-hidden min-h-[500px]",
      title: "text-white text-4xl md:text-6xl font-black text-left",
      article: "px-4 py-16 bg-white dark:bg-slate-900 mt-8 rounded-[32px] md:mx-4 shadow-xl"
    }
  };

  const style = templateStyles[settings.activeTemplate] || templateStyles.editorial;

  const handlePublish = () => {
    const slug = localStorage.getItem("pendingSlug") || "untitled-" + Math.random().toString(36).substr(2, 5);
    const siteName = localStorage.getItem("pendingSiteName") || parsedData.name;
    
    const sites = JSON.parse(localStorage.getItem("pageforge_published_sites") || "[]");
    const newSite = {
      slug,
      siteName,
      data: parsedData,
      settings,
      publishedAt: new Date().toISOString()
    };
    
    // Check if slug already exists and update or add
    const index = sites.findIndex(s => s.slug === slug);
    if (index > -1) {
      sites[index] = newSite;
    } else {
      sites.push(newSite);
    }
    
    localStorage.setItem("pageforge_published_sites", JSON.stringify(sites));
    toast.success(`Site Published to /${slug}!`);
    router.push(`/admin`); // Redirect to dashboard
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/upload" 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <span className="font-semibold hidden sm:block truncate max-w-[200px]">
              {localStorage.getItem("pendingSiteName") || parsedData.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider hidden md:block">
              Template: {settings.activeTemplate}
            </div>
            <button 
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all font-medium whitespace-nowrap"
            >
              <Globe className="w-4 h-4" />
              <span>Publish Site</span>
            </button>
            <Link href="/admin" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors">
              <SettingsIcon className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 px-4 py-12">
        <motion.article 
          key={settings.activeTemplate}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "mx-auto bg-white dark:bg-slate-900 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800",
            style.container
          )}
        >
          {/* Dynamic Header */}
          <div className={cn("w-full py-20 px-8 flex flex-col md:flex-row items-center justify-between text-left relative", style.header)}>
            {settings.activeTemplate === 'landing' ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#024B53] to-[#01353b]" />
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                <div className="z-10 max-w-xl">
                  <div className="inline-block px-4 py-1.5 bg-[#FFD700] text-[#024B53] rounded-lg text-xs font-black uppercase tracking-widest mb-6">
                    Premium Education
                  </div>
                  <h1 className={cn("text-white drop-shadow-sm mb-6 leading-tight", style.title)}>
                    {parsedData.metadata.title || parsedData.name}
                  </h1>
                  <p className="text-white/80 text-lg mb-8 max-w-md">
                    Transform your career with our globally recognized online program.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-white text-[#024B53] rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/20">
                      Apply Now
                    </button>
                    <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                      Download Brochure
                    </button>
                  </div>
                </div>

                <div className="z-10 h-64 md:h-96 aspect-square bg-slate-200/20 backdrop-blur-3xl rounded-[40px] flex items-center justify-center overflow-hidden border border-white/10 mt-12 md:mt-0">
                   <div className="text-white/20 text-xs font-bold uppercase tracking-widest text-center px-12">
                     Placeholder for Professional Hero Image
                   </div>
                </div>
              </>
            ) : (
              <>
                {style.header.includes("from") && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                )}
                <h1 className={cn("z-10 drop-shadow-sm mb-4 leading-tight", style.title)}>
                  {parsedData.metadata.title || parsedData.name}
                </h1>
                <div className="flex items-center gap-4 z-10">
                  <div className="h-0.5 w-12 bg-white/20" />
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    {new Date().toLocaleDateString()}
                  </p>
                  <div className="h-0.5 w-12 bg-white/20" />
                </div>
              </>
            )}
          </div>

          <div className={cn("prose dark:prose-invert max-w-none transition-all duration-500", style.article)}>
            {settings.activeTemplate === 'landing' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 not-prose">
                <div className="md:col-span-2 space-y-12">
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-[#024B53] flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      Program Overview
                    </h2>
                    <div 
                      className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: parsedData.content.split('<br/>').slice(0, 10).join('<br/>') }}
                    />
                  </section>
                  
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[24px] border border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold mb-6">Key Highlights</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {["UGC Recognized", "Flexible Learning", "Industry Mentors", "Placement Support"].map(item => (
                        <div key={item} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                          <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
                          <span className="text-sm font-bold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-[#024B53] text-white p-8 rounded-[24px] shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Interested in BA?</h3>
                    <p className="text-white/70 text-sm mb-6">Get a free counseling session with our experts.</p>
                    <input type="text" placeholder="Your Name" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm mb-3 outline-none focus:ring-2 ring-[#FFD700]/50" />
                    <input type="email" placeholder="Email Address" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm mb-6 outline-none focus:ring-2 ring-[#FFD700]/50" />
                    <button className="w-full py-4 bg-[#FFD700] text-[#024B53] rounded-xl font-bold hover:brightness-110 transition-all">
                      Request Call Back
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="parsed-content overflow-x-auto leading-relaxed text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: parsedData.content }} 
              />
            )}
            
            <hr className="my-12 border-slate-200 dark:border-slate-800" />
            
            <div className="flex items-center justify-between not-prose opacity-50 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">0</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">0</span>
                </button>
              </div>
              <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Forged by PageForge</p>
            </div>
          </div>
        </motion.article>

        {/* Global Floating Action Button for Settings */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link 
            href="/admin"
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl hover:scale-105 transition-all font-bold group"
          >
            <SettingsIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span>Customize Style</span>
          </Link>
        </div>
      </main>
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
