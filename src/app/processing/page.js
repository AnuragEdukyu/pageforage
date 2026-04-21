"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Brain, Code, Rocket, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { refineContentAction } from "../actions/refineWithAi";

const STAGES = [
  { id: 1, label: "Analyzing contents", icon: Brain, duration: 1500 },
  { id: 2, label: "AI Content Refinement", icon: Sparkles, duration: 2500 },
  { id: 3, label: "Applying visual styles", icon: Code, duration: 1200 },
  { id: 4, label: "Finalizing export", icon: Rocket, duration: 1000 },
];

export default function ProcessingPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const runStages = async () => {
      // Get data from localStorage
      const rawData = JSON.parse(localStorage.getItem("parsedContent") || "null");
      
      for (let i = 0; i < STAGES.length; i++) {
        setCurrentStage(i);
        const step = 100 / STAGES.length;
        const startProgress = i * step;
        const endProgress = (i + 1) * step;
        
        // Stage 2 is our AI refinement stage
        if (i === 1 && rawData) {
          try {
            const result = await refineContentAction(rawData.content, rawData.metadata);
            if (result.success) {
              // Update content with AI refined version (or original if bypassed)
              const updatedData = { ...rawData, content: result.data, refined: result.refined };
              localStorage.setItem("parsedContent", JSON.stringify(updatedData));
            }
          } catch (e) {
            console.error("AI Step Failed:", e);
          }
        }

        const startTime = Date.now();
        const duration = STAGES[i].duration;
        while (Date.now() - startTime < duration) {
          const elapsed = Date.now() - startTime;
          const p = startProgress + (elapsed / duration) * step;
          setProgress(p);
          await new Promise(r => setTimeout(r, 50));
        }
        setProgress(endProgress);
      }
      
      setTimeout(() => {
        router.push("/preview");
      }, 800);
    };

    runStages();
  }, [router]);


  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 max-w-xl mx-auto text-center">
      <div className="relative mb-16">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
        
        <div className="relative w-32 h-32 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-center overflow-hidden">
          <motion.div
            key={currentStage}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {STAGES[currentStage] && (() => {
              const Icon = STAGES[currentStage].icon;
              return <Icon className="w-16 h-16" />;
            })()}
          </motion.div>
          
          {/* Circular progress overlay */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              className="fill-none stroke-indigo-100 dark:stroke-indigo-950 stroke-[2px]"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              className="fill-none stroke-indigo-600 dark:stroke-indigo-500 stroke-[2px]"
              strokeDasharray="301.59"
              animate={{ strokeDashoffset: 301.59 - (301.59 * progress) / 100 }}
              transition={{ type: "tween", ease: "linear" }}
            />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8 tracking-tight">Forging your page...</h1>
      
      <div className="w-full space-y-6">
        {STAGES.map((stage, idx) => {
          const isActive = idx === currentStage;
          const isCompleted = idx < currentStage;
          
          return (
            <div 
              key={stage.id}
              className={cn(
                "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-500",
                isActive ? "bg-indigo-50 dark:bg-indigo-900/20 shadow-sm border border-indigo-100 dark:border-indigo-800" : "opacity-40"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500",
                isCompleted ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                isActive ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={cn(
                "font-medium",
                isActive ? "text-indigo-900 dark:text-indigo-100 scale-[1.02]" : "text-slate-500"
              )}>
                {stage.label}
              </span>
              {isActive && (
                <div className="ml-auto">
                  <div className="flex space-x-1">
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }} 
                      className="w-1.5 h-1.5 bg-indigo-600 rounded-full" 
                    />
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} 
                      className="w-1.5 h-1.5 bg-indigo-600 rounded-full" 
                    />
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} 
                      className="w-1.5 h-1.5 bg-indigo-600 rounded-full" 
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="mt-12 text-slate-400 text-sm italic">
        "Good writing is being able to take a leap of faith into the unknown."
      </p>
    </div>
  );
}
