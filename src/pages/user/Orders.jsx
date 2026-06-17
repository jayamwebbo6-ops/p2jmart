import React from 'react';
import { Link } from 'react-router-dom';
import { mockOrders } from '../../utils/mockOrders';

const Orders = () => {
  return (
    <div className="flex-1 bg-white h-full p-8">
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Link 
            key={order.id}
            to={`/my-account/order/${order.id}`}
            className="border border-gray-100 rounded-xl p-4 flex items-center space-x-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all bg-white block"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-1 flex-shrink-0">
              <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">
                {order.status} on {order.statusDate}
              </p>
              <p className="text-gray-500 text-sm">
                Placed on {order.placedDate}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
