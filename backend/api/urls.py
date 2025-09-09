
from django.urls import path
from .views import (
    RegisterView, LoginView, ArtworkListCreate, ArtworkRetrieveUpdateDestroy,
    CartListCreate, CartItemDetail, ArtworkUploadView,
    CreateOrderView, UserOrdersList
)
urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('artworks/', ArtworkListCreate.as_view()),
    path('artworks/<int:pk>/', ArtworkRetrieveUpdateDestroy.as_view()),
    path('artworks/upload/', ArtworkUploadView.as_view()),
    path('cart/', CartListCreate.as_view()),
    path('cart/<int:pk>/', CartItemDetail.as_view()),
    path('orders/', CreateOrderView.as_view()),
    path('orders/list/', UserOrdersList.as_view()),
]
