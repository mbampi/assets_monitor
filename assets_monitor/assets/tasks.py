from celery import shared_task
from django.core.mail import send_mail
import datetime
import logging

from .models import MonitoredAsset, Quotation
from .api import get_asset_quote


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

        if price >= monit_asset.upper_tunnel:
            logging.info(f'Price for {asset.symbol} is above upper tunnel')
            send_sell_email(monit_asset, price)
        elif price <= monit_asset.lower_tunnel:
            logging.info(f'Price for {asset.symbol} is below lower tunnel')
            send_buy_email(monit_asset, price)


def send_buy_email(monitoredAsset: MonitoredAsset, price: float):
    try:
        send_mail(
            f'{monitoredAsset.asset.symbol} - Alerta de compra',
            f'O preço de {monitoredAsset.asset.symbol} atingiu R$ {price.toFixed(2)} abaixo do túnel inferior de R$ {monitoredAsset.lower_tunnel.toFixed(2)}',
            from_email='matheusbampi@hotmail.com',
            recipient_list=[monitoredAsset.email],
            fail_silently=False,
        )
    except Exception as e:
        logging.error(f'Error sending email: {e}')
        raise e
    logging.info(f'Buy email sent to {monitoredAsset.email}')

def send_sell_email(monitoredAsset: MonitoredAsset, price: float):
    try:
        send_mail(
            f'{monitoredAsset.asset.symbol} - Alerta de venda',
            f'O preço de {monitoredAsset.asset.symbol} atingiu R$ {price.toFixed(2)} acima do túnel superior de R$ {monitoredAsset.upper_tunnel.toFixed(2)}',
            from_email='matheusbampi@hotmail.com',
            recipient_list=[monitoredAsset.email],
            fail_silently=False,
        )
    except Exception as e:
        logging.error(f'Error sending email: {e}')
        raise e
    logging.info(f'Sell email sent to {monitoredAsset.email}')
