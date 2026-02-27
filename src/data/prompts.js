export const initialPrompts = [
  {
    id: "p-001",
    title: "Startup Landing Page Generator",
    description:
      "Generate a high-converting landing page with value proposition, social proof, and CTA structure.",
    fullPrompt:
      "You are a senior conversion copywriter and UI strategist. Create a complete startup landing page structure for a SaaS product called [PRODUCT_NAME]. Include hero, trust section, problem/solution blocks, pricing teaser, FAQ, and call to action. Use concise copy, conversion-focused headlines, and suggest visual hierarchy for each section.",
    headerImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Marketing", "Web Design", "SaaS"],
    isFavorite: true,
    createdAt: "2026-02-01T10:32:00.000Z",
  },
  {
    id: "p-002",
    title: "Feature Prioritization Matrix",
    description:
      "Score roadmap features based on impact, effort, and user demand with a concise implementation summary.",
    fullPrompt:
      "Act as a product manager. I will provide a list of candidate features. Build a prioritization matrix that includes user impact, business impact, implementation complexity, dependency risk, and confidence score. Return the final order with reasoning and suggest an incremental release plan over three sprints.",
    headerImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    tags: ["Product", "Planning", "Teams"],
    isFavorite: false,
    createdAt: "2026-02-04T15:10:00.000Z",
  },
  {
    id: "p-003",
    title: "Prompt Refiner",
    description:
      "Improve rough prompts into clear, context-rich, and output-constrained versions for better AI results.",
    fullPrompt:
      "You are a prompt optimization assistant. Refactor my raw prompt into a high-performance version with clear role context, task objective, input assumptions, output format, constraints, and quality rubric. Then provide two alternative variants: one concise and one detailed. Keep intent identical.",
    headerImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    tags: ["AI", "Productivity", "Writing"],
    isFavorite: true,
    createdAt: "2026-02-09T09:22:00.000Z",
  },
  {
    id: "p-004",
    title: "Customer Interview Synthesizer",
    description:
      "Turn transcript excerpts into themes, pain points, and actionable product opportunities.",
    fullPrompt:
      "You are a UX researcher. Analyze the interview transcript snippets I provide. Extract key themes, recurring pain points, emotional signals, unmet needs, and direct quotes worth preserving. Produce a concise report with top opportunities, severity ratings, and recommendations for product changes.",
    headerImage:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    tags: ["UX", "Research", "Product"],
    isFavorite: false,
    createdAt: "2026-02-12T11:48:00.000Z",
  },
  {
    id: "p-005",
    title: "Technical Blog Draft",
    description:
      "Create a structured engineering blog post from rough notes, code snippets, and lessons learned.",
    fullPrompt:
      "You are a technical writer for software engineers. Turn my notes into a blog post with title options, intro hook, sectioned narrative, code walkthrough, edge-case discussion, and conclusion. Keep tone practical and avoid marketing fluff. Suggest diagrams and examples where helpful.",
    headerImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    tags: ["Writing", "Engineering", "Content"],
    isFavorite: false,
    createdAt: "2026-02-17T08:16:00.000Z",
  },
  {
    id: "p-006",
    title: "Weekly Team Update Composer",
    description:
      "Convert messy notes into a clear weekly update with wins, blockers, decisions, and next steps.",
    fullPrompt:
      "Act as an operations lead. Transform my weekly notes into an update format with sections for achievements, blockers, risk level, decisions made, and next-week priorities. Keep each bullet concise, use plain language, and include a one-paragraph executive summary.",
    headerImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Teams", "Operations", "Productivity"],
    isFavorite: true,
    createdAt: "2026-02-20T17:05:00.000Z",
  },
];
