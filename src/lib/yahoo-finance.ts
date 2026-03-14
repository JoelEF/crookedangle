// eslint-disable-next-line @typescript-eslint/no-require-imports
const yahooFinance = require("yahoo-finance2").default;

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  pe: number;
  currency: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const result = await yahooFinance.quote(symbol);
    return {
      symbol: result.symbol,
      name: result.longName || result.shortName || symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || 0,
      high52w: result.fiftyTwoWeekHigh || 0,
      low52w: result.fiftyTwoWeekLow || 0,
      pe: result.trailingPE || 0,
      currency: result.currency || "USD",
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getHistorical(
  symbol: string,
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" = "3mo"
): Promise<HistoricalData[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "1mo":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3mo":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6mo":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "2y":
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
    }

    const result = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.map((item: any) => ({
      date: item.date.toISOString().split("T")[0],
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

export async function searchStocks(
  query: string
): Promise<Array<{ symbol: string; name: string; exchange: string }>> {
  try {
    const result = await yahooFinance.search(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.quotes || [])
      .filter((q: any) => q && typeof q.symbol === "string")
      .slice(0, 10)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => ({
        symbol: q.symbol as string,
        name: (q.longname || q.shortname || q.symbol) as string,
        exchange: (q.exchange || "N/A") as string,
      }));
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return [];
  }
}

export async function getEurRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.rates?.EUR || 0.92;
  } catch {
    return 0.92;
  }
}
