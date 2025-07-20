"use client"

import React, { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Avatar } from '../ui/avatar.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useWishlist } from '../../contexts/WishlistContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { selectTheme, toggleTheme } from '../../store/slices/uiSlice';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { setIsCartOpen, getTotalItems = () => 0 } = useCart() || {};
  const { wishlist = [] } = useWishlist() || {};
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const theme = useSelector(selectTheme);
  useEffect(() => {
    console.log('Current theme:', theme);
  }, [theme]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleThemeToggle = () => {
    console.log('Theme toggle clicked');
    dispatch(toggleTheme());
    setTimeout(() => {
      console.log('Theme after dispatch:', theme);
      console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'));
    }, 100);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-orange-200 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🐕</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dog Backseat Extender</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Premium Pet Accessories</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium relative group">Home</Link>
            <button
              type="button"
              className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium relative group flex items-center focus:outline-none"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Cart
              {getTotalItems() > 0 && (
                <Badge className="ml-1 bg-orange-600 dark:bg-orange-500 text-white animate-bounce">{getTotalItems()}</Badge>
              )}
            </button>
            <Link to="/wishlist" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium relative group flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              Wishlist
              {wishlist.length > 0 && (
                <Badge className="ml-1 bg-pink-600 dark:bg-pink-500 text-white animate-bounce">{wishlist.length}</Badge>
              )}
            </Link>
            <Link to="/checkout" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium relative group">Checkout</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium relative group">Profile</Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">Logout</Button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium relative group">Login</Link>
            )}
            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="ml-2 px-2 py-2 rounded-full border border-orange-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-orange-600" />
              ) : (
                <Moon className="h-5 w-5 text-orange-300" />
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-orange-200 dark:border-gray-800 pt-4 animate-in slide-in-from-top-2 duration-200 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <button
                type="button"
                className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium flex items-center focus:outline-none"
                onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Cart {getTotalItems() > 0 && <Badge className="ml-1 bg-orange-600 dark:bg-orange-500 text-white animate-bounce">{getTotalItems()}</Badge>}
              </button>
              <Link to="/wishlist" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium flex items-center" onClick={() => setIsMenuOpen(false)}>
                <Heart className="w-4 h-4 mr-1" />
                Wishlist {wishlist.length > 0 && <Badge className="ml-1 bg-pink-600 dark:bg-pink-500 text-white animate-bounce">{wishlist.length}</Badge>}
              </Link>
              <Link to="/checkout" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>Checkout</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="ml-2">Logout</Button>
                </>
              ) : (
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
              )}
              {/* Theme Toggle Button (Mobile) */}
              <button
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                className="mt-2 px-2 py-2 rounded-full border border-orange-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 self-start"
              >
                {theme === 'light' ? (
                  <Sun className="h-5 w-5 text-orange-600" />
                ) : (
                  <Moon className="h-5 w-5 text-orange-300" />
                )}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
