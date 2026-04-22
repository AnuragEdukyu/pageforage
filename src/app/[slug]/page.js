"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Heart, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { db, COLLECTIONS } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PublishedSitePage() {
  const { slug } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const siteRef = doc(db, COLLECTIONS.SITES, slug);
        const siteSnap = await getDoc(siteRef);
        
        if (siteSnap.exists()) {
          const siteData = siteSnap.data();
          // Convert Firebase timestamp to String if needed for compatibility
          if (siteData.publishedAt?.toDate) {
            siteData.publishedAt = siteData.publishedAt.toDate().toISOString();
          }
          setSite(siteData);
        }
      } catch (error) {
        console.error("Error fetching site from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSite();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">404 - Site Not Found</h1>
        <p className="text-slate-600 mb-8 max-w-md">
          The page you are looking for doesn't exist or hasn't been forged yet.
        </p>
        <Link href="/" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold">
          Go to Home
        </Link>
      </div>
    );
  }

  const { data, settings } = site;
  const theme = settings?.theme || {};

  // Custom Animations Mapping
  const animations = {
    none: { initial: { opacity: 1 }, animate: { opacity: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slide: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    bounce: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 100 } }
  };

  const anim = animations[theme.animationType] || animations.fade;

  const templateStyles = {
    custom: {
      container: "max-w-6xl",
      header: "bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800",
      title: "font-black tracking-tight",
      article: "px-4"
    },
    editorial: {
      container: "max-w-4xl",
      header: "bg-gradient-to-br from-slate-900 to-indigo-900",
      title: "text-3xl md:text-4xl font-bold italic text-white",
      article: "p-8 md:p-12"
    },
    minimal: {
      container: "max-w-2xl bg-transparent shadow-none border-none",
      header: "bg-transparent border-b border-slate-200 dark:border-slate-800",
      title: "text-slate-900 dark:text-white text-4xl font-light",
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

  const style = templateStyles[settings?.activeTemplate] || templateStyles.editorial;
  const isCustom = settings?.activeTemplate === "custom";

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 px-4 font-outfit">
      <style jsx global>{`
        :root {
          --primary-main: ${theme.primaryColor || '#4f46e5'};
          --primary-dark: ${theme.primaryColorDark || '#818cf8'};
        }
        .custom-site h2 { 
          font-size: ${theme.titleSizeDesktop}px; 
          color: ${theme.titleColor};
          margin-bottom: ${theme.sectionGap}px;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .custom-site h2 { font-size: ${theme.titleSizeMobile}px; }
          .custom-site-section { padding-top: ${theme.sectionPaddingMobile}px; padding-bottom: ${theme.sectionPaddingMobile}px; }
        }
        .custom-site-section { 
          padding-top: ${theme.sectionPaddingDesktop}px; 
          padding-bottom: ${theme.sectionPaddingDesktop}px; 
        }
        
        /* Figma Style Spacing Guide */
        .spacing-guide .custom-site-section,
        .spacing-guide section,
        .spacing-guide .parsed-content > * {
          outline: ${theme.showSpacingGuide ? '1px dashed #ec4899' : 'none'};
          background: ${theme.showSpacingGuide ? 'rgba(236, 72, 153, 0.05)' : 'transparent'};
          position: relative;
        }
        .spacing-guide .custom-site-section::before {
          content: 'Padding: ${theme.sectionPaddingDesktop}px';
          display: ${theme.showSpacingGuide ? 'block' : 'none'};
          position: absolute;
          top: 2px;
          left: 2px;
          font-size: 8px;
          background: #ec4899;
          color: white;
          padding: 1px 4px;
          z-index: 50;
        }

        .custom-site p {
          font-size: ${theme.paragraphSizeDesktop}px;
          line-height: 1.6;
        }
      `}</style>

      <motion.article 
        initial={anim.initial}
        animate={anim.animate}
        transition={anim.transition || { duration: 0.6, ease: "easeOut" }}
        className={cn(
          "mx-auto bg-white dark:bg-slate-900 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl",
          style.container,
          isCustom && "custom-site",
          theme.showSpacingGuide && "spacing-guide"
        )}
      >
        <div className={cn(
          "w-full px-8 flex flex-col md:flex-row items-center justify-between text-left relative", 
          isCustom ? "py-12" : "py-20",
          style.header
        )}>
          {settings?.activeTemplate === 'landing' ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-[#024B53] to-[#01353b]" />
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              <div className="z-10 max-w-xl text-center md:text-left">
                <div className="inline-block px-4 py-1.5 bg-[#FFD700] text-[#024B53] rounded-lg text-xs font-black uppercase tracking-widest mb-6 mx-auto md:mx-0">
                  {site.siteName}
                </div>
                <h1 className={cn("text-white drop-shadow-sm mb-6 leading-tight", style.title)}>
                  {data.title || site.siteName}
                </h1>
                <p className="text-white/80 text-lg mb-8 max-w-md">
                  Successfully forged from your PDF content.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button className="px-8 py-4 bg-white text-[#024B53] rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/20">
                    Get Started
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {isCustom && <div className="h-1.5 w-24 bg-indigo-500 rounded-full mb-4" />}
              <h1
                className={cn("z-10 drop-shadow-sm leading-tight", style.title, !isCustom && "text-white")}
                style={isCustom ? { fontSize: theme.titleSizeDesktop, color: theme.titleColor } : {}}
              >
                {data.title || site.siteName}
              </h1>
              <div className="flex items-center gap-4 z-10">
                <p className={cn("text-xs font-bold uppercase tracking-widest", isCustom ? "text-slate-400" : "text-white/60")}>
                  Published: {new Date(site.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={cn(
          "prose dark:prose-invert max-w-none transition-all duration-500", 
          isCustom ? "custom-site-section" : style.article
        )}>
          <div 
            className="parsed-content overflow-x-auto leading-relaxed text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: data.content }} 
          />
          
          <hr className="my-12 border-slate-200 dark:border-slate-800" />
          
          <div className="flex items-center justify-between not-prose opacity-50 px-8 pb-8">
            <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Forged by PageForge • /{slug}</p>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

