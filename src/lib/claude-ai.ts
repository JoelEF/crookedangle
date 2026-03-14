import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIAnalysis {
  summary: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  recommendation: string;
  confidenceScore: number;
}

export async function analyzeStock(
  symbol: string,
  name: string,
  price: number,
  changePercent: number,
  technicalSignal: string,
  technicalScore: number,
  rsi: number,
  pe: number,
  marketCap: number
): Promise<AIAnalysis> {
  const prompt = `Je bent een professionele aandelenanalist. Analyseer het volgende aandeel en geef een beknopt advies in het Nederlands.

Aandeel: ${name} (${symbol})
Huidige prijs: $${price.toFixed(2)}
Dagwijziging: ${changePercent.toFixed(2)}%
Technisch signaal: ${technicalSignal} (score: ${technicalScore}/100)
RSI: ${rsi.toFixed(1)}
P/E ratio: ${pe > 0 ? pe.toFixed(1) : "N/A"}
Marktkapitalisatie: ${marketCap > 1e9 ? `$${(marketCap / 1e9).toFixed(1)}B` : `$${(marketCap / 1e6).toFixed(0)}M`}

Geef een analyse in JSON formaat met:
- summary: 2-3 zinnen samenvatting
- sentiment: "BULLISH", "BEARISH", of "NEUTRAL"
- keyPoints: array van 3-4 belangrijkste punten
- risks: array van 2-3 risico's
- opportunities: array van 2-3 kansen
- recommendation: concrete aanbeveling (1 zin)
- confidenceScore: getal 0-100 (vertrouwen in analyse)

Antwoord ALLEEN met geldige JSON.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const analysis = JSON.parse(jsonMatch[0]) as AIAnalysis;
    return analysis;
  } catch (error) {
    console.error("Claude AI analysis error:", error);
    return {
      summary: "Analyse tijdelijk niet beschikbaar. Controleer uw API sleutel.",
      sentiment: "NEUTRAL",
      keyPoints: ["Technische data is beschikbaar", "Zie indicatoren hierboven"],
      risks: ["Marktvolatiliteit", "Macro-economische factoren"],
      opportunities: ["Technische analyse wijst op kansen"],
      recommendation: "Voer eigen onderzoek uit voordat u investeert.",
      confidenceScore: 0,
    };
  }
}
