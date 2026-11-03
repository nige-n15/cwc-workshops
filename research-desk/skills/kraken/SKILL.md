---
name: kraken-market-data
description: How to pull Kraken public market data (USD pairs) with Python requests — pair resolution, ticker, daily OHLC, order-book depth and recent trades, plus the desk's recipes for returns, volatility, drawdown, spread, depth and USD volume. Use whenever a task involves crypto prices, Kraken, or liquidity of a crypto asset.
---

# Kraken public market data

The desk reads Kraken's **public** REST API: no key, no account, read-only. Base URL `https://api.kraken.com/0/public/`. Use Python with `requests` (preinstalled), not hand-fetched pages. Never call private endpoints.

Every response is `{"error": [...], "result": {...}}`. **Check `error` first** — a non-empty list means the call failed even with HTTP 200.

```python
import requests, time, math

BASE = "https://api.kraken.com/0/public/"

def kraken(endpoint, **params):
    r = requests.get(BASE + endpoint, params=params, timeout=20)
    r.raise_for_status()
    body = r.json()
    if body["error"]:
        raise RuntimeError(f"{endpoint}: {body['error']}")
    return body["result"]
```

## Pair naming (the quirks)

Kraken has legacy asset codes: **BTC is `XBT`**, **DOGE is `XDG`**. The `result` key in responses is the *internal* pair name (`XXBTZUSD`, `XETHZUSD`, `XXLMZUSD`) — not what you asked for. Resolve once and reuse:

```python
def resolve_gbp_pair(symbol):
    """BTC -> ('XBTUSD', 'XXBTZUSD'). Raises if there is no USD pair."""
    result = kraken("AssetPairs", pair=f"{symbol}USD")
    key, info = next(iter(result.items()))
    return info["altname"], key
```

Desk watchlist pairs: XBTUSD, ETHUSD, BNBUSD, XRPUSD, SOLUSD, TRXUSD, ZECUSD, HYPEUSD, XMRUSD, XDGUSD.

## Ticker — price, spread, 24h volume

```python
t = kraken("Ticker", pair=altname)[key]
ask, bid, last = float(t["a"][0]), float(t["b"][0]), float(t["c"][0])
mid = (ask + bid) / 2
spread_bps = (ask - bid) / mid * 1e4
vol_24h_base = float(t["v"][1])          # index 1 = last 24h, index 0 = today
vwap_24h = float(t["p"][1])
volume_24h_usd_k = vol_24h_base * vwap_24h / 1e3
trades_24h = int(t["t"][1])
```

## Daily OHLC — returns, volatility, drawdown

Rows are `[time, open, high, low, close, vwap, volume, count]`; time is Unix seconds, prices are strings. Up to 720 rows. **The last row is today's still-forming candle** — use it for the latest close, but be aware it is partial.

```python
rows = kraken("OHLC", pair=altname, interval=1440)[key]
closes = [float(r[4]) for r in rows]

def ret(days):
    return (closes[-1] / closes[-1 - days] - 1) * 100

log_r = [math.log(closes[i] / closes[i - 1]) for i in range(len(closes) - 30, len(closes))]
mean = sum(log_r) / len(log_r)
vol_30d_pct = math.sqrt(sum((x - mean) ** 2 for x in log_r) / (len(log_r) - 1)) * math.sqrt(365) * 100

window = closes[-91:]
peak, max_dd = window[0], 0.0
for c in window:
    peak = max(peak, c)
    max_dd = min(max_dd, (c / peak - 1) * 100)   # negative number
```

Crypto trades every day, so annualize with √365 and count calendar days.

## Order book — depth within 1% of mid

```python
book = kraken("Depth", pair=altname, count=500)[key]
lo, hi = mid * 0.99, mid * 1.01
bid_gbp = sum(float(p) * float(v) for p, v, _ in book["bids"] if float(p) >= lo)
ask_gbp = sum(float(p) * float(v) for p, v, _ in book["asks"] if float(p) <= hi)
depth_1pct_usd_k = (bid_gbp + ask_gbp) / 1e3
```

## Recent trades — is anyone actually trading?

```python
tr = kraken("Trades", pair=altname)
last_trade_age_min = (time.time() - float(tr[key][-1][2])) / 60
```

## Liquidity red flags (desk thresholds)

Market cap is not liquidity: on Kraken USD, BNB (top five by market cap) trades around $1m a day while ZEC trades around $30m. Flag:

- 24h USD volume under $100k
- spread over 50 bps
- under $10k of depth within 1% on either side
- last trade more than an hour ago

## Etiquette

Public endpoints are rate-limited (roughly one call per second sustained). One pass of Ticker + OHLC + Depth + Trades per asset is plenty; don't poll. On `EGeneral:Too many requests`, wait a few seconds and retry once.
