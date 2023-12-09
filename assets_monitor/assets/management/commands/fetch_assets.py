from django.core.management.base import BaseCommand
from assets.models import Asset
import investpy as inv


class Command(BaseCommand):
    help = 'Fetch assets from API and store them in the database'

    def handle(self, *args, **kwargs):
        try:
            stocks = inv.stocks.get_stocks(country='brazil')

            for stock in stocks.iterrows():
                stock_data = stock[1]
                symbol = stock_data['symbol']
                name = stock_data['full_name']
                if not Asset.objects.filter(symbol=symbol).exists():
                    Asset.objects.create(name=name, symbol=symbol) 
                else:
                    self.stdout.write(self.style.WARNING('Asset ' + symbol + ' already exists'))

            self.stdout.write(self.style.SUCCESS('Successfully fetched and saved assets'))
        except Exception as e:
            self.stdout.write(self.style.ERROR('Failed to fetch and save assets'))
            self.stdout.write(self.style.ERROR(e))
