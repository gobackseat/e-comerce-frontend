import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from '../components/home-sections/Header.tsx';
import Footer from '../components/home-sections/Footer.tsx';
import { useCart } from '../contexts/CartContext.jsx';
import { config } from '../utils/config';
import { Button } from '../components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${config.baseURL}/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.data.product || data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart({
        id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        count: quantity
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">Error: {error}</div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <img
                src={product.image || "/Assets/imgs/backseat-extender-for-dogs (1).png"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600">(4.8/5)</span>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-4">${product.price}</div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 border rounded-md min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.countInStock}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {product.countInStock} items in stock
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.countInStock === 0}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={product.countInStock === 0}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Add to Wishlist
                </Button>
              </div>

              {/* Product Features */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Waterproof leather material</li>
                  <li>• Easy installation and removal</li>
                  <li>• Built-in storage pockets</li>
                  <li>• Mesh window for visibility</li>
                  <li>• Door covers for extra protection</li>
                  <li>• Two dog seat belts included</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">Product not found</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage; 