"use client";

import { useState, useEffect } from "react";
import { Settings, Layout, Palette, Monitor, ArrowLeft, Save, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { getSettings, updateSettings } from "@/lib/store";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("sites");
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    setSettings(getSettings());
    const savedSites = JSON.parse(localStorage.getItem("pageforge_published_sites") || "[]");
    setSites(savedSites);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    updateSettings(settings);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Changes saved successfully!");
    }, 800);
  };

  const handleTemplateSelect = (templateId) => {
    setSettings(prev => ({ ...prev, activeTemplate: templateId }));
  };

  const deleteSite = (slug) => {
    const updated = sites.filter(s => s.slug !== slug);
    setSites(updated);
    localStorage.setItem("pageforge_published_sites", JSON.stringify(updated));
    toast.info("Site removed.");
  };

  if (!settings) return null;

  const TABS = [
    { id: "sites", label: "My Sites", icon: Globe },
    { id: "templates", label: "Templates", icon: Palette },
    { id: "figma", label: "Figma Sync", icon: Monitor },
    { id: "advanced", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 px-2">Dashboard</h2>
        
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                activeTab === tab.id 
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-20">
          <div className="p-4 bg-indigo-600 rounded-2xl text-white">
            <h3 className="text-sm font-bold mb-1">Developer Mode</h3>
            <p className="text-xs opacity-80 mb-3">You are managing this for your designer friend.</p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all">
              Manage API
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-12 overflow-auto">
        <div className="max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === 'sites' ? "View and manage your designer's published pages." : "Control how content is presented."}
              </p>
            </div>
            {activeTab !== 'sites' && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            )}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {activeTab === "sites" && (
              <div className="col-span-full space-y-4">
                {sites.length === 0 ? (
                  <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-slate-400 mb-4">No sites published yet.</p>
                    <Link href="/upload" className="text-indigo-600 font-bold text-sm hover:underline">
                      Forge your first page →
                    </Link>
                  </div>
                ) : (
                  sites.map((site) => (
                    <div key={site.slug} className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                          <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{site.siteName}</h4>
                          <Link href={`/${site.slug}`} target="_blank" className="text-sm text-indigo-500 hover:underline">
                            /{site.slug}
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/${site.slug}`} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
                          View
                        </Link>
                        <Link href={`/edit/${site.slug}`} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                          Edit
                        </Link>
                        <button 
                          onClick={() => deleteSite(site.slug)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === "templates" && (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <TemplateCard 
                  id="custom"
                  name="No Template (Custom AI)" 
                  image="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop"
                  isActive={settings.activeTemplate === "custom"}
                  onSelect={handleTemplateSelect}
                />
                <TemplateCard 
                  id="editorial"
                  name="Modern Editorial" 
                  image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=400&auto=format&fit=crop"
                  isActive={settings.activeTemplate === "editorial"}
                  onSelect={handleTemplateSelect}
                />
                <TemplateCard 
                  id="minimal"
                  name="Minimal Text" 
                  image="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=400&auto=format&fit=crop"
                  isActive={settings.activeTemplate === "minimal"}
                  onSelect={handleTemplateSelect}
                />
                <TemplateCard 
                  id="academic"
                  name="Academic Whitepaper" 
                  image="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=400&auto=format&fit=crop"
                  isActive={settings.activeTemplate === "academic"}
                  onSelect={handleTemplateSelect}
                />
              </div>
            )}

            {activeTab === "mapping" && (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">Pattern Auto-Mapping</h3>
                  <p className="text-sm text-slate-500">Automatically assign templates based on file names.</p>
                </div>
                <div className="p-6 space-y-4">
                  <MappingRow pattern="*.md" template="Modern Editorial" />
                  <MappingRow pattern="Technical_*.pdf" template="Academic Whitepaper" />
                  <button className="text-sm font-bold text-indigo-600 mt-4">+ Add New Rule</button>
                </div>
              </div>
            )}

            {activeTab === "figma" && (
              <div className="col-span-full space-y-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center rounded-2xl text-pink-600">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white">Direct Figma Sync</h3>
                      <p className="text-sm text-slate-500">Link your workspace tokens directly from Figma.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Figma File URL</label>
                      <input 
                        type="text" 
                        value={settings.figmaUrl}
                        onChange={(e) => setSettings(prev => ({ ...prev, figmaUrl: e.target.value }))}
                        placeholder="https://www.figma.com/file/..." 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Personal Access Token</label>
                      <input 
                        type="password" 
                        value={settings.figmaToken}
                        onChange={(e) => setSettings(prev => ({ ...prev, figmaToken: e.target.value }))}
                        placeholder="figd_..." 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                      <Globe className="w-5 h-5" />
                      Sync Figma Tokens
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="col-span-full space-y-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    Visual Design Specs
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Typography Section */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Typography</h4>
                      <div>
                        <label className="block text-sm font-bold mb-2">Heading Color (H2)</label>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="color" 
                            value={settings.theme.titleColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, titleColor: e.target.value } }))}
                            className="w-10 h-10 rounded-lg cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={settings.theme.titleColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, titleColor: e.target.value } }))}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-2">H2 Desktop (px)</label>
                          <input 
                            type="number" 
                            value={settings.theme.titleSizeDesktop || ""}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, titleSizeDesktop: parseInt(e.target.value) || "" } }))}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-2">H2 Mobile (px)</label>
                          <input 
                            type="number" 
                            value={settings.theme.titleSizeMobile || ""}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, titleSizeMobile: parseInt(e.target.value) || "" } }))}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Spacing & Guides Section */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Layout & Spacing</h4>
                      <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", settings.theme.showSpacingGuide ? "bg-pink-100 text-pink-600" : "bg-slate-200 text-slate-500")}>
                            <Layout className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Visual Guide</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Figma Style Spacing</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSettings(prev => ({ ...prev, theme: { ...prev.theme, showSpacingGuide: !prev.theme.showSpacingGuide } }))}
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors relative",
                            settings.theme.showSpacingGuide ? "bg-pink-500" : "bg-slate-300 dark:bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                            settings.theme.showSpacingGuide ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Section Gap (mb)</label>
                        <input 
                          type="range" min="0" max="120" step="4"
                          value={settings.theme.sectionGap || 0}
                          onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, sectionGap: parseInt(e.target.value) || 0 } }))}
                          className="w-full accent-indigo-600"
                        />
                        <div className="text-right text-xs text-slate-500 font-bold mt-1">{settings.theme.sectionGap}px</div>
                      </div>
                    </div>

                    {/* Pro Features Section */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Pro Customization</h4>
                      <div>
                        <label className="block text-sm font-bold mb-2">Dark Mode Primary</label>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="color" 
                            value={settings.theme.primaryColorDark}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, primaryColorDark: e.target.value } }))}
                            className="w-10 h-10 rounded-lg cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={settings.theme.primaryColorDark}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, primaryColorDark: e.target.value } }))}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Entry Animation</label>
                        <select 
                          value={settings.theme.animationType}
                          onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, animationType: e.target.value } }))}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/30"
                        >
                          <option value="none">Instant (No Animation)</option>
                          <option value="fade">Smooth Fade-In</option>
                          <option value="slide">Slide up & reveal</option>
                          <option value="bounce">Bounce active</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </main>
    </div>
  );
}

function ConfigCard({ title, description, isActive }) {
  return (
    <div className={cn(
      "p-6 rounded-3xl border transition-all duration-300",
      isActive 
        ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10" 
        : "bg-slate-100/50 dark:bg-slate-900/20 border-transparent text-slate-400"
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
          isActive ? "border-indigo-500 bg-indigo-500" : "border-slate-300 dark:border-slate-700"
        )}>
          {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
      <p className="text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TemplateCard({ id, name, image, isActive, onSelect }) {
  return (
    <button 
      onClick={() => onSelect(id)}
      className={cn(
        "group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all text-left",
        isActive ? "border-indigo-500 shadow-2xl scale-[1.02]" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-sm mb-0.5">{name}</p>
        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">
          {isActive ? "Currently Active" : "Click to Select"}
        </p>
      </div>
    </button>
  );
}

function MappingRow({ pattern, template }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-indigo-600 font-bold">{pattern}</code>
        <div className="h-px w-4 bg-slate-200 dark:bg-slate-700" />
        <span className="text-sm font-medium">{template}</span>
      </div>
      <button className="text-xs text-slate-400 hover:text-red-500 transition-colors uppercase font-bold tracking-tighter">Remove</button>
    </div>
  );
}
