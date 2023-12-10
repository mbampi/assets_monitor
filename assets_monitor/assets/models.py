from django.db import models


# Asset is a model that contains information about a stock asset.
class Asset(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.symbol


# Quotation is a model that contains information about a quote for a single asset,
# including a foreign key to the Asset model and info such as price, date and time.
class Quotation(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=4)
    date = models.DateField()
    time = models.TimeField()

    def __str__(self):
        return self.asset.symbol + " " + str(self.date) + " " + str(self.time)


# MonitoredAsset is a model that contains information about a monitored asset,
# including a foreign key to the Asset model and info such as last price, upper tunnel,
# lower tunnel, monitoring frequency and email.
class MonitoredAsset(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, unique=True)
    last_price = models.DecimalField(max_digits=10, decimal_places=4)
    upper_tunnel = models.DecimalField(max_digits=10, decimal_places=4)
    lower_tunnel = models.DecimalField(max_digits=10, decimal_places=4)
    email = models.EmailField(max_length=100)
    frequency = models.IntegerField(default=10)
    last_email_sent = models.DateTimeField(default=None, null=True)
    last_price_check = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return (
            self.asset.symbol
            + " "
            + str(self.last_price)
            + " "
            + str(self.upper_tunnel)
            + " "
            + str(self.lower_tunnel)
            + " "
            + self.email
        )
