
from django.contrib import admin
from .models import Artwork, CartItem, Order, OrderItem
@admin.register(Artwork)
class ArtworkAdmin(admin.ModelAdmin):
    list_display = ('id','title','price','created_at')
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id','user','artwork','quantity','added_at')
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id','user','total','created_at')
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id','order','artwork','quantity','price')
