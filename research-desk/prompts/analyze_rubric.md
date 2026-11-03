# Rubric: Kraken USD market analysis for {ticker}

Grade each criterion independently against the deliverables.

1. **Scorecard delivered** — `/mnt/session/outputs/scorecard.json` exists, parses as a single JSON object, and contains every required field with the documented types (numbers as numbers, `trend` and `confidence` from the allowed values, list fields within their caps). The final reply contains the same JSON.
2. **Numbers are grounded** — every figure comes from Kraken's public API for a USD pair (the scorecard's `pair` and `as_of` identify the snapshot); returns are consistent with each other and with the price; volatility, spread, depth and USD volume are arithmetically plausible and the method is stated in the memory note.
3. **Liquidity is assessed honestly** — `spread_bps`, `depth_1pct_usd_k` and `volume_24h_usd_k` are reflected in `red_flags` when they are poor (e.g. very low USD volume or a wide spread), not glossed over.
4. **Memory note written** — a note exists in the desk memory at the path given in `memory_note_path`, for the same snapshot, with the template's sections present, and `changes_since_last_note` matches what the prior note (if any) said.
5. **Honest uncertainty, no advice** — anything the agent could not verify is reflected in `data_caveats` or `confidence`; there are no price predictions or buy/sell instructions.
