You are running the desk's scheduled weekly memo. Watchlist (each against USD on Kraken): {watchlist}.

1. Use Kraken's public REST API with `requests`, as documented in your kraken skill (no key needed).
2. Read the desk memory under `/assets/` to see what the desk already knows and when each note was written.
3. For each watchlist asset, pull the current USD ticker and the last 8 daily candles. Pick the three assets with the largest weekly move or the biggest change in liquidity and do a focused update: refresh the numbers and write a new dated note at `/assets/<TICKER>/<YYYY-MM-DD>.md`.
4. Write the weekly memo to both `/mnt/session/outputs/weekly-memo.md` and the desk memory at `/memos/<today>-weekly.md`, covering: the week's 7d returns for the whole watchlist in one table; what moved and what changed versus the desk's notes; the two or three themes across the group; where USD liquidity is thin; which notes are now stale.
5. Your final reply is the memo itself. Research, not advice: no buy/sell instructions.
