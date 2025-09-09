from django.views.generic import TemplateView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import transaction
from .models import Artwork, CartItem, Order, OrderItem
from .serializers import RegisterSerializer, ArtworkSerializer, CartItemSerializer, UserSerializer, OrderSerializer, CreateOrderSerializer


class FrontendAppView(TemplateView):
    template_name = "index.html"
    
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class ArtworkListCreate(generics.ListCreateAPIView):
    queryset = Artwork.objects.all().order_by('-id')
    serializer_class = ArtworkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ArtworkRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ArtworkUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        title = request.data.get('title')
        description = request.data.get('description', '')
        price = request.data.get('price', '0')
        image = request.FILES.get('image')
        if not title or not image:
            return Response({'detail': 'Title and image are required'}, status=status.HTTP_400_BAD_REQUEST)
        art = Artwork.objects.create(title=title, description=description, price=price, image=image)
        return Response(ArtworkSerializer(art).data, status=status.HTTP_201_CREATED)

class CartListCreate(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        items = CartItem.objects.filter(user=request.user)
        ser = CartItemSerializer(items, many=True)
        return Response(ser.data)

    def post(self, request):
        ser = CartItemSerializer(data=request.data)
        if ser.is_valid():
            item, created = CartItem.objects.get_or_create(
                user=request.user,
                artwork=ser.validated_data['artwork'],
                defaults={'quantity': ser.validated_data.get('quantity', 1)}
            )
            if not created:
                item.quantity += ser.validated_data.get('quantity', 1)
                item.save()
            return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

class CartItemDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        ser = CreateOrderSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        items = ser.validated_data['items']
        with transaction.atomic():
            total = 0
            order = Order.objects.create(user=request.user, total=0)
            for it in items:
                art = Artwork.objects.filter(pk=it['artwork_id']).first()
                if not art:
                    transaction.set_rollback(True)
                    return Response({'detail': f'Artwork {it["artwork_id"]} not found'}, status=status.HTTP_400_BAD_REQUEST)
                price = art.price
                qty = it['quantity']
                OrderItem.objects.create(order=order, artwork=art, quantity=qty, price=price)
                total += float(price) * qty
            order.total = total
            order.save()
            CartItem.objects.filter(user=request.user).delete()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class UserOrdersList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-id')
