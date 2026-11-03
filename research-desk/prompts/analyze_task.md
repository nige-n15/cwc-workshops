Analyze {ticker} against USD on Kraken and produce the desk's standard deliverables. Analytical focus for this run: {focus}.

Steps:

1. Resolve the Kraken USD pair for {ticker} with the `AssetPairs` endpoint, as your kraken skill describes (e.g. BTC → XBTUSD, DOGE → XDGUSD). If there is no USD pair, say so and stop with a scorecard explaining it in `data_caveats`.
2. Check the desk memory for existing notes under `/assets/{ticker}/`. Read the most recent one so you can say what changed.
3. Delegate to your specialists as needed:
   - market-data specialist → price, 7d/30d/90d returns, 30d realized volatility, 90d max drawdown, trend;
   - liquidity analyst → spread, depth within 1%, 24h USD volume, liquidity red flags.
4. Write the two deliverables:
   - **Memory note** at `/assets/{ticker}/<YYYY-MM-DD>.md` (today's UTC date) with sections: Snapshot (pair, as-of time, price), Price action, Liquidity, Risks, Changes since last note, Red flags, One-line thesis.
   - **Scorecard** at `/mnt/session/outputs/scorecard.json` — a single JSON object with exactly these fields:
     `ticker` (the symbol you were given, e.g. "{ticker}"), `asset_name`, `pair` (the Kraken altname, e.g. "XBTUSD"), `as_of` (ISO-8601 UTC of the data snapshot),
     `price_usd`, `return_7d_pct`, `return_30d_pct`, `return_90d_pct`, `volatility_30d_pct` (annualized),
     `max_drawdown_90d_pct` (negative number), `volume_24h_usd_k` (thousands of USD), `spread_bps`, `depth_1pct_usd_k` (bid + ask depth within 1% of mid, thousands of USD),
     `trend` (one of: uptrend, downtrend, range),
     `key_risks` (max 3 short strings), `changes_since_last_note` (max 3; "first note for this asset" if none), `red_flags` (array, may be empty),
     `one_line_thesis`, `confidence` (low/medium/high), `memory_note_path`,
     `data_caveats` (optional string).
     Numbers are plain numbers (percent as numbers, e.g. -4.2), not strings.
5. Your final reply: the scorecard JSON verbatim, followed by a three-sentence summary of how the asset is trading in USD.
