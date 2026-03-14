export interface TechnicalIndicators {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  sma20: number;
  sma50: number;
  sma200: number;
  ema20: number;
  stochastic: { k: number; d: number };
  signal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  score: number; // -100 to 100
}

function calcSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter((c) => c > 0);
  const losses = recentChanges.filter((c) => c < 0).map(Math.abs);

  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcMACD(
  prices: number[]
): { value: number; signal: number; histogram: number } {
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const macdLine = ema12 - ema26;

  // Use last 9 MACD values for signal
  const macdValues = [];
  for (let i = Math.max(0, prices.length - 35); i < prices.length; i++) {
    const e12 = calcEMA(prices.slice(0, i + 1), 12);
    const e26 = calcEMA(prices.slice(0, i + 1), 26);
    macdValues.push(e12 - e26);
  }
  const signalLine = calcEMA(macdValues, 9);
  const histogram = macdLine - signalLine;

  return { value: macdLine, signal: signalLine, histogram };
}

function calcBollingerBands(
  prices: number[],
  period = 20
): { upper: number; middle: number; lower: number } {
  const sma = calcSMA(prices, period);
  const slice = prices.slice(-period);
  const variance = slice.reduce((acc, p) => acc + Math.pow(p - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: sma + 2 * stdDev,
    middle: sma,
    lower: sma - 2 * stdDev,
  };
}

function calcStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): { k: number; d: number } {
  if (closes.length < period) return { k: 50, d: 50 };
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const currentClose = closes[closes.length - 1];

  const k =
    highestHigh === lowestLow
      ? 50
      : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

  // Simple D as 3-period SMA of K
  const kValues = [];
  for (let i = Math.max(0, closes.length - 3); i < closes.length; i++) {
    const h = Math.max(...highs.slice(i - period + 1, i + 1));
    const l = Math.min(...lows.slice(i - period + 1, i + 1));
    const c = closes[i];
    kValues.push(h === l ? 50 : ((c - l) / (h - l)) * 100);
  }
  const d = kValues.reduce((a, b) => a + b, 0) / kValues.length;

  return { k, d };
}

export function calculateIndicators(
  closes: number[],
  highs: number[],
  lows: number[]
): TechnicalIndicators {
  const rsi = calcRSI(closes);
  const macd = calcMACD(closes);
  const bollingerBands = calcBollingerBands(closes);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const ema20 = calcEMA(closes, 20);
  const stochastic = calcStochastic(highs, lows, closes);
  const currentPrice = closes[closes.length - 1];

  // Score system: -100 to +100
  let score = 0;

  // RSI signals (weight: 25)
  if (rsi < 30) score += 25; // oversold = bullish
  else if (rsi < 40) score += 12;
  else if (rsi > 70) score -= 25; // overbought = bearish
  else if (rsi > 60) score -= 12;

  // MACD signals (weight: 25)
  if (macd.histogram > 0 && macd.value > 0) score += 25;
  else if (macd.histogram > 0) score += 12;
  else if (macd.histogram < 0 && macd.value < 0) score -= 25;
  else if (macd.histogram < 0) score -= 12;

  // Price vs SMA signals (weight: 30)
  if (sma50 > 0 && sma200 > 0) {
    if (currentPrice > sma20 && sma20 > sma50) score += 15;
    else if (currentPrice < sma20 && sma20 < sma50) score -= 15;

    if (sma50 > sma200) score += 15; // golden cross territory
    else score -= 15; // death cross territory
  }

  // Bollinger Bands (weight: 10)
  if (currentPrice < bollingerBands.lower) score += 10;
  else if (currentPrice > bollingerBands.upper) score -= 10;

  // Stochastic (weight: 10)
  if (stochastic.k < 20 && stochastic.k > stochastic.d) score += 10;
  else if (stochastic.k > 80 && stochastic.k < stochastic.d) score -= 10;

  score = Math.max(-100, Math.min(100, score));

  let signal: TechnicalIndicators["signal"];
  if (score >= 60) signal = "STRONG_BUY";
  else if (score >= 20) signal = "BUY";
  else if (score <= -60) signal = "STRONG_SELL";
  else if (score <= -20) signal = "SELL";
  else signal = "NEUTRAL";

  return {
    rsi,
    macd,
    bollingerBands,
    sma20,
    sma50,
    sma200,
    ema20,
    stochastic,
    signal,
    score,
  };
}
