"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, FileText, Settings, Layout } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { db, COLLECTIONS } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

export default function EditSitePage() {
  const { slug } = useParams();
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const siteRef = doc(db, COLLECTIONS.SITES, slug);
        const siteSnap = await getDoc(siteRef);
        
        if (siteSnap.exists()) {
          const found = siteSnap.data();
          setSite(found);
          setContent(found.data.content);
          setTitle(found.data.title || found.siteName);
        } else {
          toast.error("Site not found in cloud!");
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error fetching site:", error);
        toast.error("Failed to fetch site from cloud.");
      }
    };

    if (slug) {
      fetchSite();
    }
  }, [slug, router]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const siteRef = doc(db, COLLECTIONS.SITES, slug);
      await updateDoc(siteRef, {
        siteName: title,
        "data.content": content,
        "data.title": title,
        updatedAt: serverTimestamp()
      });
      
      toast.success("Cloud content updated successfully!");
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error("Failed to save changes to cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!site) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[200px]">{site.siteName}</h1>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none">Editing Live Page / {slug}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href={`/${slug}`} 
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Preview Live
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl shadow-lg transition-all font-bold hover:scale-105 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Editor Side */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Visual Designer</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </div>
            </div>
            
            <div className="space-y-6 flex-1 flex flex-col">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Page Title</label>
                <input
                  type="text"
                  dir="ltr"
                  lang="en"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-xl font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all font-outfit"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black uppercase text-slate-400">Content canvas</label>
                  <p className="text-[10px] text-slate-400 font-medium italic">Click text to edit directly</p>
                </div>
                
                {/* Visual Editor Toolbelt */}
                <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <button onClick={() => document.execCommand('bold')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all font-bold">B</button>
                  <button onClick={() => document.execCommand('italic')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all italic font-serif">I</button>
                  <button onClick={() => document.execCommand('insertUnorderedList')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all underline">List</button>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                  <button onClick={() => document.execCommand('formatBlock', false, 'h2')} className="text-xs p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all font-bold">H2</button>
                  <button onClick={() => document.execCommand('formatBlock', false, 'p')} className="text-xs p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">P</button>
                </div>

                <div
                  ref={(el) => {
                    if (el && !el.innerHTML) {
                      el.innerHTML = content;
                    }
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  dir="ltr"
                  lang="en"
                  spellCheck="true"
                  onInput={(e) => {
                    const html = e.currentTarget.innerHTML;
                    setContent(html);
                  }}
                  onKeyDown={(e) => {
                    // Force cursor to behave LTR
                    e.currentTarget.style.direction = 'ltr';
                  }}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 overflow-auto focus:ring-4 ring-indigo-500/10 outline-none max-w-none text-slate-700 dark:text-slate-300 editor-ltr"
                  style={{
                    minHeight: '300px',
                    direction: 'ltr !important',
                    textAlign: 'left !important',
                    unicodeBidi: 'bidi-override',
                    writingMode: 'horizontal-tb'
                  }}
                >
                  {!content && <span className="text-slate-400">Start typing...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Browser Simulation Side */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Responsive Preview
            </h3>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative border-8">
            <div className="absolute inset-0 overflow-auto p-8 custom-preview">
              <h1 className="text-4xl font-black mb-8 tracking-tighter" style={{ color: site.settings?.theme?.titleColor || '#025E68' }}>
                {title}
              </h1>
              <div 
                className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-400 leading-relaxed parsed-content"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-preview::-webkit-scrollbar {
          width: 6px;
        }
        .custom-preview::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        /* AGGRESSIVE LTR enforcement */
        .editor-ltr,
        .editor-ltr *,
        .editor-ltr::before,
        .editor-ltr::after {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: bidi-override !important;
        }

        input[type="text"] {
          direction: ltr !important;
          text-align: left !important;
        }

        /* Force all text input to be LTR */
        [contenteditable="true"] {
          -webkit-writing-mode: horizontal-tb !important;
          writing-mode: horizontal-tb !important;
          direction: ltr !important;
        }

        /* Override any inline RTL styles */
        [dir="rtl"] {
          direction: ltr !important;
        }
      `}</style>
    </div>
  );
}


