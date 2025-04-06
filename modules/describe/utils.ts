import { OpenAI } from "@openai/openai";

function getOpenAi(): OpenAI {
  return new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")!,
  });
}

export default {
  getOpenAi,
};
