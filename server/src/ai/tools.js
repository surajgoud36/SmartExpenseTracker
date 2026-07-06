export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Other",
];

export const tools = [
  {
    name: "get_spending_summary",
    description:
      "Get total spending, top categories, and a 6-month trend. Use this first for broad questions like 'how am I doing this month' or 'why was last month higher'.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_category_breakdown",
    description:
      "Get spending grouped by category for a specific month. Use when the user asks about a particular month's composition.",
    input_schema: {
      type: "object",
      properties: {
        year: { type: "integer", description: "e.g. 2026" },
        month: { type: "integer", description: "1-12" },
      },
      required: ["year", "month"],
    },
  },
  {
    name: "query_expenses",
    description:
      "List individual expense transactions, optionally filtered by category and/or date range. Use for questions about specific transactions, like 'what did I spend on transport last week'.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: CATEGORIES },
        dateFrom: {
          type: "string",
          description: "ISO date, inclusive, e.g. 2026-06-01",
        },
        dateTo: {
          type: "string",
          description: "ISO date, exclusive, e.g. 2026-07-01",
        },
        limit: {
          type: "integer",
          description: "Max results, default 20, max 50",
        },
      },
    },
  },
  {
    name: "add_expense",
    description:
      "Create a new expense. Use ONLY when the user explicitly asks to add/record/log an expense (e.g. 'add 500 for groceries'). Never invent expenses. If the amount or a sensible category is unclear, ask the user instead of guessing. Amount must be in rupees as the user said it.",
    input_schema: {
      type: "object",
      properties: {
        amountRupees: {
          type: "number",
          description: "Amount in rupees, e.g. 500 or 249.5",
        },
        category: { type: "string", enum: CATEGORIES },
        description: {
          type: "string",
          description: "Short label, e.g. 'groceries'",
        },
        date: { type: "string", description: "ISO date. Omit for today." },
      },
      required: ["amountRupees", "category"],
    },
  },
];
