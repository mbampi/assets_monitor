from rest_framework import serializers
from .models import Asset, Quotation, MonitoredAsset

# AssetSerializer serializes the Asset model, with the fields symbol and name.
# It also has a field optional_fields, which is used to add the price field.
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['symbol', 'name']
        optional_fields = ['price']

# MonitoredAssetSerializer serializes the MonitoredAsset model,
# getting the symbol and name from the Asset model.
class MonitoredAssetSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source='asset.symbol')
    name = serializers.CharField(source='asset.name')
    class Meta:
        model = MonitoredAsset
        fields = ['symbol', 'name', 'last_price', 'upper_tunnel', 'lower_tunnel', 'email', 'frequency']

# QuotationSerializer serializes the Quotation model, 
# with the fields price, date and time.
class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quotation
        fields = ['price', 'date', 'time']
