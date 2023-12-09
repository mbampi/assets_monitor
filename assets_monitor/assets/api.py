import investpy as inv 
import yfinance as yf

# get_all_assets returns a list of all the bovespa assets.
def get_all_assets():
    return inv.get_stocks_list("brazil")

# get_asset_quote returns a single asset quote.
def get_asset_quote(symbol: str) -> float:
    stock = yf.Ticker(symbol+".SA")
    price = stock.info.get('regularMarketPrice', stock.info.get('currentPrice'))
    return price