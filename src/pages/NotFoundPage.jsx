import React from "react";
import Header from '../components/home-sections/Header.tsx';
import Footer from '../components/home-sections/Footer.tsx';

const NotFoundPage = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-4xl font-extrabold text-orange-700 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">The page you are looking for does not exist.</p>
        <a href="/" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors">Go to Homepage</a>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage; 