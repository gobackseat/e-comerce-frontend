import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ShoppingCart, Check, Plus, Minus, Heart, Share2, Star } from "lucide-react";
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { config } from '../../utils/config';
import { motion, AnimatePresence } from "framer-motion";

const colorOptions = [
  { name: "Black", value: "black", hex: "#1a1a1a", image: "/Assets/imgs/backseat-extender-for-dogs (1).png" },
  { name: "Brown", value: "brown", hex: "#8B4513", image: "/Assets/imgs/backseat-extender-for-dogs (1).png" },
  { name: "Gray", value: "gray", hex: "#6B7280", image: "/Assets/imgs/backseat-extender-for-dogs (1).png" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      staggerChildren: 0.15,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const detailsVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function ProductShowcase() {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted, loading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${config.baseURL}/products`, { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const productData = data.data?.product || data.product || (data.products && data.products[0]);
        if (productData) {
          setProduct(productData);
        } else {
          setError('No product found.');
        }
      })
      .catch(err => {
        setError('Could not load product. Please try again later.');
        console.error('Product fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const wishlisted = product ? isWishlisted(product) : false;

  const handleWishlist = async () => {
    if (!product) return;
    try {
      if (wishlisted) {
        await removeFromWishlist(product);
      } else {
        await addToWishlist(product);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const item = {
      ...product,
      id: product._id,
      color: selectedColor.name,
      image: selectedColor.image,
      deliveryNotes,
      count: quantity,
    };
    addToCart(item);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const item = {
      ...product,
      id: product._id,
      color: selectedColor.name,
      image: selectedColor.image,
      deliveryNotes,
      count: quantity,
    };
    addToCart(item);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg flex justify-center items-center h-96">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;
  }
  if (!product) {
    return <div className="p-8 text-center text-lg">No product available.</div>;
  }

  return (
    <motion.section
      id="product"
      className="py-20 bg-white relative overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto relative z-10">
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <Card className="overflow-hidden shadow-2xl border-0 group rounded-2xl">
              <CardContent className="p-0 relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedColor.value}
                    src={selectedColor.image}
                    alt={`Dog Backseat Extender in ${selectedColor.name}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.5, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </AnimatePresence>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-500 text-white shadow-lg border-none">
                    <Check className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`rounded-full transition-all duration-300 ${wishlisted ? 'animate-pulse' : ''}`}
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 transition-colors duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <motion.div variants={itemVariants} className="space-y-4">
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
            </motion.div>
          </motion.div>

          <motion.div
            variants={detailsVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">🔥 Best Seller</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(product.ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviewsCount} reviews)</span>
                <span className="text-green-600 font-semibold">✓ Verified Purchase</span>
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-6">
                ${product.price.toFixed(2)}
                <span className="text-lg text-gray-500 line-through ml-2">${(product.price * 1.25).toFixed(2)}</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Label className="text-gray-700 font-medium text-base">Quantity:</Label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-r-none"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-l-none"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-notes" className="text-gray-700 font-medium text-base">
                  Special Delivery Instructions (Optional)
                </Label>
                <Textarea
                  id="delivery-notes"
                  placeholder="Add any special instructions for delivery..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="resize-none focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600 pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium">24/7 Support</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
} 