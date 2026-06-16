import React from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link to="/admin/products/add" className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors">Add Product</Link>
      </div>
      <p className="text-gray-600">Manage your product catalog here.</p>
    </div>
  );
};

export default Products;
