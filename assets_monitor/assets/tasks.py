from celery import shared_task
from .models import MonitoredAsset, Quotation
import datetime
from .api import get_asset_quote
import logging

@shared_task
def fetch_and_store_asset_prices():
    monitored_assets = MonitoredAsset.objects.all()

    for monit_asset in monitored_assets:
        asset = monit_asset.asset
        price = get_asset_quote(asset.symbol)
        if price is None:
            logging.error(f'Error fetching price for {asset.symbol}')
            continue
        logging.info(f'Price for {asset.symbol}: {price} type: {type(price)}')
        
        Quotation.objects.create(
            asset=asset,
            price=price,
            date=datetime.date.today(),
            time=datetime.datetime.now().time()
        )
