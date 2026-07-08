import Anthropic from "@anthropic-ai/sdk";
import { tools } from "../ai/tools.js";
import { executors } from "../ai/executors.js";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MODEL = "claude-sonnet-4-6";
const MAX_ITERATIONS = 6;

const SYSTEM_PROMPT = `You are a financial insights assistant inside a personal expense tracker.
Today's date is {{TODAY}}. All amounts are Indian rupees (₹).

Rules:
- Use tools to get real data before answering. Never estimate or invent numbers.
- Only call add_expense when the user clearly asks to record an expense. If the amount is missing or ambiguous, ask a clarifying question instead.
- When you add an expense, confirm back the exact amount, category, and date you recorded.
- Keep answers short and conversational. Mention concrete numbers.
- If asked something unrelated to personal spending, politely steer back.`;

export async function chat(req, res) {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array required" });
    }

    const system = SYSTEM_PROMPT.replace(
      "{{TODAY}}",
      new Date().toISOString().slice(0, 10),
    );

    const convo = [...messages]; // [{role:'user'|'assistant', content:'...'}]
    let wroteData = false;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system,
        tools,
        messages: convo,
      });

      if (response.stop_reason !== "tool_use") {
        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        return res.json({ reply: text, wroteData });
      }

      // Claude wants tools: append its turn, run each tool, append results
      convo.push({ role: "assistant", content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        let result;
        try {
          const fn = executors[block.name];
          result = fn
            ? await fn(req.userId,block.input)
            : { error: `Unknown tool: ${block.name}` };
          if (block.name === "add_expense" && result.created) wroteData = true;
        } catch (err) {
          result = { error: err.message };
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      convo.push({ role: "user", content: toolResults });
    }

    res.json({
      reply: "I couldn't finish that request — try asking in a simpler way.",
      wroteData,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Chat failed" });
  }
}
