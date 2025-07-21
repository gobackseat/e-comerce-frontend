import React from "react";
import { useWishlist } from "../contexts/WishlistContext.jsx";
import { Button } from "../components/home-sections/ui/button.tsx";
import Header from '../components/home-sections/Header.tsx';
import Footer from '../components/home-sections/Footer.tsx';

const WishlistPage = () => {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">My Wishlist</h1>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Loading wishlist...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 font-semibold">{error}</div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Your wishlist is empty.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {wishlist.map((item) => (
                <li key={item._id} className="flex items-center py-4 gap-4">
                  <img
                    src={item.image || item.images?.[0] || "/Assets/imgs/backseat-extender-for-dogs (1).png"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-gray-900 truncate">{item.name}</h2>
                    <p className="text-orange-600 font-bold text-lg">${item.price || item.basePrice || 0}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => removeFromWishlist(item._id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage; 