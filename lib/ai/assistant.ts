/**
 * AI Assistant - Stubbed implementation
 * This provides a clean interface for AI-assisted financial analysis
 * In production, integrate with OpenAI, Anthropic, or other LLM providers
 */

import { AssistantRequest, AssistantResponse } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/financeEngine/utils";

/**
 * Main AI assistant function
 * This is a stub that returns context-aware canned responses
 */
export async function askFinanceAssistant(
  request: AssistantRequest
): Promise<AssistantResponse> {
  const { question, context } = request;
  const lowerQuestion = question.toLowerCase();

  // Pattern matching for common questions
  if (lowerQuestion.includes("burn") && lowerQuestion.includes("high")) {
    return {
      answer: generateBurnAnalysis(context),
      suggestions: [
        "Consider reducing fixed costs by 20%",
        "Explore outsourcing instead of hiring full-time",
        "Review your CAC - can you acquire customers more efficiently?",
      ],
      relatedMetrics: context?.currentSummary
        ? [
            {
              name: "Peak Monthly Burn",
              value: formatCurrency(context.currentSummary.peakBurn),
            },
            {
              name: "Avg Monthly Burn",
              value: formatCurrency(context.currentSummary.avgMonthlyBurn),
            },
          ]
        : undefined,
    };
  }

  if (lowerQuestion.includes("churn")) {
    return {
      answer: generateChurnAnalysis(context),
      suggestions: [
        "Implement a customer success program",
        "Add annual pricing to reduce churn",
        "Survey churned customers to understand pain points",
      ],
    };
  }

  if (lowerQuestion.includes("runway") || lowerQuestion.includes("raise")) {
    return {
      answer: generateRunwayAnalysis(context, lowerQuestion),
      suggestions: [
        "Start fundraising conversations 6 months before runway ends",
        "Model multiple scenarios: base case and with additional funding",
        "Consider ways to extend runway through revenue growth or cost cuts",
      ],
      relatedMetrics: context?.currentSummary
        ? [
            {
              name: "Current Ending Cash",
              value: formatCurrency(context.currentSummary.endingCash),
            },
            {
              name: "Zero Cash Month",
              value: context.currentSummary.zeroCashMonth || "N/A",
            },
          ]
        : undefined,
    };
  }

  if (lowerQuestion.includes("growth") || lowerQuestion.includes("mrr")) {
    return {
      answer: generateGrowthAnalysis(context),
      suggestions: [
        "Focus on expansion revenue from existing customers",
        "Experiment with new customer acquisition channels",
        "Consider a product-led growth motion",
      ],
      relatedMetrics: context?.currentSummary
        ? [
            {
              name: "MRR Growth",
              value: formatPercentage(context.currentSummary.mrrGrowthPercent),
            },
            {
              name: "Ending MRR",
              value: formatCurrency(context.currentSummary.endingMRR),
            },
          ]
        : undefined,
    };
  }

  // Default response
  return {
    answer: `I can help you analyze your financial model. Based on your question about "${question}", here are some general considerations:\n\nFor early-stage SaaS companies, focus on:\n• Unit economics (LTV:CAC ratio > 3:1)\n• Efficient growth (keep burn multiple under control)\n• Runway management (maintain 12+ months)\n• Product-market fit indicators\n\nWould you like me to analyze specific metrics from your model?`,
    suggestions: [
      "Ask about your burn rate",
      "Analyze your growth trajectory",
      "Review your runway and funding needs",
      "Compare your metrics to benchmarks",
    ],
  };
}

/**
 * Generate burn rate analysis
 */
function generateBurnAnalysis(
  context?: AssistantRequest["context"]
): string {
  if (!context?.currentSummary) {
    return "Your burn rate is a critical metric. For a healthy SaaS business at the seed stage, you should aim for 12-18 months of runway. Peak burn typically occurs during periods of rapid hiring or customer acquisition investment.";
  }

  const { peakBurn, avgMonthlyBurn, endingCash } = context.currentSummary;
  const runway = endingCash / avgMonthlyBurn;

  return `Based on your current projections:

• Your peak monthly burn is ${formatCurrency(peakBurn)}
• Average monthly burn: ${formatCurrency(avgMonthlyBurn)}
• Estimated runway: ${runway.toFixed(1)} months

${
  runway < 12
    ? "⚠️ Your runway is below 12 months. Consider:\n• Extending runway through revenue growth\n• Reducing burn by optimizing costs\n• Starting fundraising conversations soon"
    : runway < 18
    ? "Your runway is acceptable but could be extended. Focus on efficient growth and consider your next fundraise timeline."
    : "Your runway looks healthy. Continue monitoring burn as you scale."
}`;
}

/**
 * Generate churn analysis
 */
function generateChurnAnalysis(
  context?: AssistantRequest["context"]
): string {
  return `Churn rate is one of the most important metrics for SaaS businesses. Here's what to consider:

**Benchmarks:**
• SMB SaaS: 3-7% monthly churn is typical
• Mid-market: 1-2% monthly churn
• Enterprise: 0.5-1% monthly churn

**Impact on your business:**
Higher churn directly reduces your LTV and makes customer acquisition more expensive. A 3% improvement in churn can increase LTV by 30-50%.

**Actions to reduce churn:**
1. Implement proactive customer success
2. Add annual contracts with discounts
3. Build stronger product engagement loops
4. Survey churned customers quarterly`;
}

/**
 * Generate runway analysis
 */
function generateRunwayAnalysis(
  context?: AssistantRequest["context"],
  question?: string
): string {
  const additionalFunding = extractFundingAmount(question || "");

  if (!context?.currentSummary) {
    return `Runway management is critical. As a rule of thumb:
• Start fundraising with 9-12 months runway remaining
• Plan for 6-9 months to close a round
• Always maintain a 6-month buffer

${
  additionalFunding
    ? `If you raise $${(additionalFunding / 1000).toFixed(0)}K, model how that extends your runway and what milestones you can hit.`
    : ""
}`;
  }

  const { endingCash, avgMonthlyBurn, zeroCashMonth } = context.currentSummary;
  const currentRunway = endingCash / avgMonthlyBurn;

  let analysis = `Current runway: ${currentRunway.toFixed(1)} months\n`;

  if (additionalFunding) {
    const extendedRunway = (endingCash + additionalFunding) / avgMonthlyBurn;
    const additionalMonths = extendedRunway - currentRunway;
    analysis += `\nWith $${(additionalFunding / 1000).toFixed(0)}K raised:\n`;
    analysis += `• Total runway: ${extendedRunway.toFixed(1)} months\n`;
    analysis += `• Additional runway: ${additionalMonths.toFixed(1)} months\n`;
    analysis += `\nThis would give you time to hit key milestones before your next raise.`;
  }

  if (zeroCashMonth) {
    analysis += `\n\n⚠️ Current projections show cash depletion in ${zeroCashMonth}. `;
    analysis += currentRunway < 12
      ? "Start fundraising immediately."
      : "Begin preparing your fundraise deck and reaching out to investors.";
  }

  return analysis;
}

/**
 * Generate growth analysis
 */
function generateGrowthAnalysis(
  context?: AssistantRequest["context"]
): string {
  if (!context?.currentSummary) {
    return `Strong growth is important, but efficient growth is critical. Key metrics:

• **Rule of 40**: Growth rate + Profit margin should be > 40%
• **Burn multiple**: Net burn / Net new ARR should be < 1.5x
• **Magic number**: Net new ARR / Sales & marketing spend

Focus on sustainable, capital-efficient growth rather than growth at all costs.`;
  }

  const { mrrGrowthPercent, startingMRR, endingMRR } = context.currentSummary;

  return `Your MRR growth: ${formatPercentage(mrrGrowthPercent)}

From ${formatCurrency(startingMRR)} to ${formatCurrency(endingMRR)}

${
  mrrGrowthPercent < 100
    ? "For a seed-stage company, you should aim for 2-3x annual growth (100-200%). Consider:\n• Increasing marketing spend (if unit economics are healthy)\n• Adding new customer acquisition channels\n• Focusing on product-led growth"
    : mrrGrowthPercent < 200
    ? "Your growth rate is solid. Focus on maintaining efficiency while scaling."
    : "Strong growth! Ensure you're maintaining healthy unit economics as you scale."
}`;
}

/**
 * Extract funding amount from question
 */
function extractFundingAmount(question: string): number | null {
  const patterns = [
    /\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*k/i,
    /\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*thousand/i,
    /\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*m(?:illion)?/i,
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ""));
      if (question.match(/m(?:illion)?/i)) {
        return num * 1000000;
      }
      return num * 1000;
    }
  }

  return null;
}

/**
 * Get suggested questions based on current state
 */
export function getSuggestedQuestions(
  hasProjections: boolean = false
): string[] {
  if (!hasProjections) {
    return [
      "What metrics should I focus on for my stage?",
      "How do I calculate LTV:CAC ratio?",
      "What's a healthy burn rate?",
      "When should I start my next fundraise?",
    ];
  }

  return [
    "Is my burn rate too high for my stage?",
    "What happens if churn increases by 3%?",
    "How many months of runway do I have if I raise $500K more?",
    "How does my growth rate compare to benchmarks?",
    "What should my target LTV:CAC ratio be?",
  ];
}
