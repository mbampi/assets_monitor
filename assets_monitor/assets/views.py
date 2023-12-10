from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponseBadRequest
from .models import Asset, Quotation, MonitoredAsset
from .serializers import AssetSerializer, QuotationSerializer, MonitoredAssetSerializer
import logging
from .api import get_asset_quote


class AssetList(generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetMonitoringList(generics.ListAPIView):
    queryset = MonitoredAsset.objects.all()
    serializer_class = MonitoredAssetSerializer


class AssetDetail(generics.RetrieveAPIView):
    """this view returns a single asset and its current price, getting the price from the API"""

    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    def get(self, request, *args, **kwargs):
        symbol = self.kwargs.get("symbol")
        try:
            asset = Asset.objects.get(symbol=symbol)
        except Asset.DoesNotExist:
            return Response(
                {"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND
            )
        else:
            price = get_asset_quote(symbol)
            if price is None:
                return Response(
                    {"error": "Error fetching price"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            else:
                return Response(
                    {"symbol": asset.symbol, "name": asset.name, "price": price}
                )


class ToggleMonitoring(APIView):
    def post(self, request, symbol, enable):
        try:
            asset = Asset.objects.get(symbol=symbol)

            if enable:
                logging.info("enable monitoring", request.data)
                lower_tunnel = request.data.get("lower_tunnel")
                upper_tunnel = request.data.get("upper_tunnel")
                email = request.data.get("email")
                frequency = request.data.get("frequency")

                try:
                    lower_tunnel = float(lower_tunnel)
                    upper_tunnel = float(upper_tunnel)
                    frequency = int(frequency)
                except ValueError:
                    return HttpResponseBadRequest(
                        "Invalid value for lower_tunnel or upper_tunnel or frequency"
                    )

                if lower_tunnel >= upper_tunnel:
                    return HttpResponseBadRequest(
                        "lower_tunnel must be lower than upper_tunnel"
                    )

                MonitoredAsset.objects.update_or_create(
                    asset=asset,
                    last_price=0,
                    upper_tunnel=upper_tunnel,
                    lower_tunnel=lower_tunnel,
                    email=email,
                    frequency=frequency,
                    last_email_sent=None,
                )

            else:
                MonitoredAsset.objects.filter(asset=asset).delete()

            action = "enabled" if enable else "disabled"
            return Response({"message": f"Monitoring {action} for asset {symbol}."})
        except Asset.DoesNotExist:
            return Response(
                {"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND
            )


class EnableMonitoring(ToggleMonitoring):
    def post(self, request, symbol):
        return super().post(request, symbol, True)


class DisableMonitoring(ToggleMonitoring):
    def post(self, request, symbol):
        return super().post(request, symbol, False)


class QuotationList(generics.ListAPIView):
    serializer_class = QuotationSerializer

    def get_queryset(self):
        symbol = self.kwargs.get("symbol")
        if symbol is not None:
            n = self.request.query_params.get("n")
            if n is not None:
                try:
                    n = int(n)
                except ValueError:
                    return HttpResponseBadRequest("Invalid value for argument n")
                else:
                    return Quotation.objects.filter(asset__symbol=symbol).order_by(
                        "-date", "-time"
                    )[:n]
            else:
                return Quotation.objects.filter(asset__symbol=symbol)
        else:
            return Quotation.objects.all()

    def get(self, request, *args, **kwargs):
        symbol = self.kwargs.get("symbol")
        if symbol is not None:
            try:
                Asset.objects.get(symbol=symbol)
            except Asset.DoesNotExist:
                return Response(
                    {"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND
                )
        return super().get(request, *args, **kwargs)
