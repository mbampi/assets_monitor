from django.urls import path
from .views import AssetList, AssetDetail, EnableMonitoring, DisableMonitoring, QuotationList, AssetMonitoringList

urlpatterns = [
    path('', AssetList.as_view(), name='asset-list'),
    path('monitored', AssetMonitoringList.as_view(), name='asset-monitored-list'),
    path('<str:symbol>', AssetDetail.as_view(), name='asset-detail'),

    path('enable-monitoring/<str:symbol>', EnableMonitoring.as_view(), name='enable-monitoring'),
    path('disable-monitoring/<str:symbol>', DisableMonitoring.as_view(), name='disable-monitoring'),
    
    path('quotation/<str:symbol>', QuotationList.as_view(), name='quotation-list'),
    path('quotation', QuotationList.as_view(), name='quotation-list'),
]
