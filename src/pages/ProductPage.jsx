import React, { useEffect, useState } from "react";
import Header from '../components/home-sections/Header.tsx';
import Footer from '../components/home-sections/Footer.tsx';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/all");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {loading ? <div>Loading...</div> : error ? <div>Error: {error}</div> : (
          <>
            <h1 className="text-2xl font-bold mb-6">Products</h1>
            <ul className="space-y-4">
              {products.map((product) => (
                <li key={product._id || product.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold">{product.name}</span>
                  <span className="text-orange-700 font-bold">${product.price}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage; 