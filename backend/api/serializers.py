
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Artwork, CartItem, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ArtworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artwork
        fields = ['id', 'title', 'description', 'price', 'image']

class CartItemSerializer(serializers.ModelSerializer):
    artwork = ArtworkSerializer(read_only=True)
    artwork_id = serializers.PrimaryKeyRelatedField(
        queryset=Artwork.objects.all(), write_only=True, source='artwork'
    )

    class Meta:
        model = CartItem
        fields = ['id', 'artwork', 'artwork_id', 'quantity']

class OrderItemSerializer(serializers.ModelSerializer):
    artwork = ArtworkSerializer(read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'artwork', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'total', 'created_at', 'items']

class CreateOrderItemSerializer(serializers.Serializer):
    artwork_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class CreateOrderSerializer(serializers.Serializer):
    items = CreateOrderItemSerializer(many=True)
