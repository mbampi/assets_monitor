from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
import logging
import os

from .models import MonitoredAsset, Quotation
from .api import get_asset_quote

@shared_task
def fetch_and_store_asset_prices():
    for monit_asset in MonitoredAsset.objects.all():
        if is_time_to_check(monit_asset):
            price = fetch_and_store_price(monit_asset)
            if price is not None:
                check_tunnel_price_and_send_email(monit_asset, price)

def is_time_to_check(monit_asset: MonitoredAsset) -> bool:
    if monit_asset.last_price_check is None:
        return True
    elapsed_time = (timezone.now() - monit_asset.last_price_check).total_seconds()
    return elapsed_time >= monit_asset.frequency * 60

def fetch_and_store_price(monit_asset: MonitoredAsset) -> float:
    price = get_asset_quote(monit_asset.asset.symbol)
    if price is None:
        logging.error(f"Error fetching price for {monit_asset.asset.symbol}")
        return None

    Quotation.objects.create(
        asset=monit_asset.asset,
        price=price,
        date=timezone.now().date(),
        time=timezone.now().time(),
    )

    monit_asset.last_price = price
    monit_asset.last_price_check = timezone.now()
    monit_asset.save()
    return price

def check_tunnel_price_and_send_email(monit_asset: MonitoredAsset, price: float):
    if (monit_asset.last_email_sent is None) or (monit_asset.last_email_sent.date() != timezone.now().date()):
        if price >= monit_asset.upper_tunnel:
            send_email(monit_asset, price, 'sell')
        elif price <= monit_asset.lower_tunnel:
            send_email(monit_asset, price, 'buy')

def send_email(monitored_asset: MonitoredAsset, price: float, action: str):
    subject, message = create_email_content(monitored_asset, price, action)
    try:
        send_mail(
            subject,
            message,
            from_email=os.getenv('SENDER_EMAIL', 'inoa@test.com'),
            recipient_list=[monitored_asset.email],
            fail_silently=False,
        )
        logging.info(f"{action.title()} email sent to {monitored_asset.email}")
        monitored_asset.last_email_sent = timezone.now()
        monitored_asset.save()
    except Exception as e:
        logging.error(f"Error sending {action} email: {e}")

def create_email_content(monitored_asset: MonitoredAsset, price: float, action: str) -> tuple:
    symbol = monitored_asset.asset.symbol
    if action == 'sell':
        return (
            f"{symbol} - Alerta de venda",
            f"O preço de {symbol} atingiu R$ {price:.2f} acima do túnel superior de R$ {monitored_asset.upper_tunnel:.2f}"
        )
    elif action == 'buy':
        return (
            f"{symbol} - Alerta de compra",
            f"O preço de {symbol} atingiu R$ {price:.2f} abaixo do túnel inferior de R$ {monitored_asset.lower_tunnel:.2f}"
        )
