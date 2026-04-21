"use server";

import { anthropic, AI_CONFIG } from "@/lib/anthropic";

export async function refineContentAction(content, metadata) {
  // BYPASS Logic: If AI is disabled or key is missing, return original content immediately
  if (!AI_CONFIG.isEnabled) {
    console.log("AI Refinement bypassed: AI is disabled or key is missing.");
    return { success: true, data: content, refined: false };
  }

  try {
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are a professional web editor. Refine the following content for a premium web publication. 
          Make it more engaging, fix structural flow, and ensure it looks great in HTML. 
          Return ONLY the refined HTML content. 
          
          Context/Metadata: ${JSON.stringify(metadata)}
          
          Content: ${content}`
        }
      ]
    });

    return { 
      success: true, 
      data: response.content[0].text, 
      refined: true 
    };
  } catch (error) {
    console.error("AI Refinement Error:", error);
    // Silent fallback: If AI fails, don't break the app, just use original content
    return { success: true, data: content, refined: false, error: error.message };
  }
}
