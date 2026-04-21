"use client";

import Link from "next/link";
import { MoveRight, FileText, Sparkles, Layout, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400 mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Level 1 Early Access
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
          Bring your designs <br /> 
          <span className="text-indigo-600 dark:text-indigo-400">straight to the web.</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate tool for designers to publish content without hitting a line of code. 
          Upload your PDF, choose a slug, and your webpage is live on your domain instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 hover:-translate-y-1"
          >
            Forge a New Site
            <MoveRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 active:scale-95"
          >
            My Dashboard
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl"
      >
        <FeatureCard 
          icon={<FileText className="w-6 h-6 text-indigo-500" />}
          title="Any Format"
          description="Upload your .md or .pdf files. We handle the formatting for you."
        />
        <FeatureCard 
          icon={<Zap className="w-6 h-6 text-amber-500" />}
          title="Instant AI"
          description="Our logic analyzes your content and builds a custom layout."
        />
        <FeatureCard 
          icon={<Layout className="w-6 h-6 text-emerald-500" />}
          title="Beautiful UI"
          description="Export to clean, modern responsive pages that wow readers."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 text-left bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl shadow-sm dark:bg-slate-900/50">
      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
