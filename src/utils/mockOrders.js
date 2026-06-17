export const mockOrders = [
  {
    id: 'ORD-2026-005',
    status: 'Processing',
    statusColor: 'text-yellow-600 bg-yellow-50',
    statusDate: 'May 14',
    placedDate: 'May 14, 2026',
    items: [
      {
        name: 'Red Roses Bouquet',
        color: 'Red',
        qty: 1,
        price: 1000.00,
        image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=150&q=80',
      }
    ],
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    subtotal: 1000.00,
    shipping: 100.00,
    total: 1100.00,
    shippingAddress: {
      name: 'zubair',
      address: 'tenkasi, Thenkasi, tamilnadu - 121258.',
      phone: '8610071893'
    }
  },
  {
    id: 'ORD-2026-004',
    status: 'Processing',
    statusColor: 'text-yellow-600 bg-yellow-50',
    statusDate: 'May 14',
    placedDate: 'May 14, 2026',
    items: [
      {
        name: 'Wooden Cat Statue',
        color: 'Brown',
        qty: 1,
        price: 2500.00,
        image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=150&q=80',
      }
    ],
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    subtotal: 2500.00,
    shipping: 0.00,
    total: 2500.00,
    shippingAddress: {
      name: 'zubair',
      address: 'tenkasi, Thenkasi, tamilnadu - 121258.',
      phone: '8610071893'
    }
  },
  {
    id: 'ORD-2026-003',
    status: 'Delivered',
    statusColor: 'text-green-600 bg-green-50',
    statusDate: 'May 10',
    placedDate: 'May 08, 2026',
    items: [
      {
        name: 'Custom Printed Mug',
        color: 'White',
        qty: 2,
        price: 350.00,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=150&q=80',
      }
    ],
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    subtotal: 700.00,
    shipping: 50.00,
    total: 750.00,
    shippingAddress: {
      name: 'zubair',
      address: 'tenkasi, Thenkasi, tamilnadu - 121258.',
      phone: '8610071893'
    }
  },
  {
    id: 'ORD-2026-002',
    status: 'Cancelled',
    statusColor: 'text-red-600 bg-red-50',
    statusDate: 'May 05',
    placedDate: 'May 04, 2026',
    items: [
      {
        name: 'Bluetooth Headphones',
        color: 'Black',
        qty: 1,
        price: 4999.00,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
      }
    ],
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    subtotal: 4999.00,
    shipping: 0.00,
    total: 4999.00,
    shippingAddress: {
      name: 'zubair',
      address: 'tenkasi, Thenkasi, tamilnadu - 121258.',
      phone: '8610071893'
    }
  }
];
