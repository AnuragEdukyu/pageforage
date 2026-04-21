import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const isAiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI === "true";

export const anthropic = (isAiEnabled && apiKey && apiKey !== "paste_your_key_here") 
  ? new Anthropic({ apiKey }) 
  : null;

export const AI_CONFIG = {
  isEnabled: !!anthropic,
  model: "claude-3-5-sonnet-20240620"
};
