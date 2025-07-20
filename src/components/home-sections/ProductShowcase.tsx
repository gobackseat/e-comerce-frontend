"use client"

import React, { useState, useEffect } from "react";
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Card, CardContent } from '../ui/card.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Label } from '../ui/label.jsx';
import { ShoppingCart, Check, Plus, Minus, Heart, Share2 } from "lucide-react";
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext.jsx';
import { config } from '../../utils/config';

const colorOptions = [
  { name: "Black", value: "black", hex: "#1a1a1a", image: "/Assets/imgs/backseat-extender-for-dogs (1).png" },
  { name: "Brown", value: "brown", hex: "#8B4513", image: "/Assets/imgs/backseat-extender-for-dogs (1).png" },
  { name: "Gray", value: "gray", hex: "#6B7280", image: "/Assets/imgs/backseat-extender-for-dogs (1).png" },
]

export default function ProductShowcase() {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const [quantity, setQuantity] = useState(1)
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart()
  const { wishlist = [], addToWishlist, removeFromWishlist, isWishlisted, loading: wishlistLoading } = useWishlist() || {};

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${config.baseURL}/products`, { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.data && data.data.product) setProduct(data.data.product);
        else if (data.product) setProduct(data.product);
        else if (data.products && data.products.length > 0) setProduct(data.products[0]);
        else {
          setProduct(null);
          setError('No product found.');
        }
      })
      .catch(err => {
        setError('Could not load product. Please try again later.');
        setProduct(null);
        console.error('Product fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const wishlisted = product ? isWishlisted(product._id) : false;

  const handleWishlist = async () => {
    if (!product) return;
    try {
      if (wishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      // Optionally show a toast or error
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor.name,
      image: selectedColor.image,
      deliveryNotes,
      count: quantity,
    })
    setIsCartOpen(true)
  }

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading product...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;
  }
  if (!product) {
    return <div className="p-8 text-center text-lg">No product available.</div>;
  }

  return (
    <section id="product" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Product Images */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-2xl border-0 group">
              <CardContent className="p-0 relative">
                <div className="relative overflow-hidden">
                  <img
                    src={selectedColor.image}
                    alt={`Dog Backseat Extender in ${selectedColor.name}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white shadow-lg">
                      <Check className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className={`bg-white/90 hover:bg-white ${wishlisted ? 'animate-pulse' : ''}`}
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 transition-colors duration-200 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose Color</h3>
              <div className="flex space-x-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-4 transition-all duration-300 ${
                      selectedColor.value === color.value
                        ? "border-orange-500 scale-110 shadow-lg"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor.value === color.value && <Check className="w-6 h-6 text-white mx-auto" />}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">Selected: {selectedColor.name}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">🔥 Best Seller</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Black Leather Backseat Extender for Dogs – with Door Covers
              </h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Check key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(2,847 reviews)</span>
                <span className="text-green-600 font-semibold">✓ Verified Purchase</span>
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-6">
                $140.00
                <span className="text-lg text-gray-500 line-through ml-2">$180.00</span>
                <span className="text-sm text-green-600 ml-2">Save $40</span>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Black Leather Backseat Extender for Dogs designed to expand your car's rear seat, prevents slipping into
                the footwell while ensuring a secure and stress-free ride. Made from waterproof leather, it protects
                your car from scratches and includes door covers for extra protection. Two dog seat belts for safety,
                and built-in storage pockets, this rear seat extender for dogs is easy to install and clean—perfect for
                long journeys with your pup!
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Label className="text-gray-700 font-medium">Quantity:</Label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="space-y-2">
                <Label htmlFor="delivery-notes" className="text-gray-700 font-medium">
                  Special Delivery Instructions (Optional)
                </Label>
                <Textarea
                  id="delivery-notes"
                  placeholder="Add any special instructions for delivery..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ${(140 * quantity).toFixed(2)}
                </Button>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                >
                  Buy Now
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
