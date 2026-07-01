import React from 'react';
import logo from '../../public/logo.png';

const OrderInvoice = ({ order, invoiceColors, formatImageUrl, formatDate, contactData }) => {
  if (!order) return null;

  return (
    <div 
      id="order-invoice-download-template" 
      className="bg-white text-black font-sans p-8" 
      style={{ 
        width: '800px', 
        fontSize: '12px', 
        lineHeight: '1.5',
        boxSizing: 'border-box'
      }}
    >
      {/* Style settings for custom classes if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .invoice-table th {
          background-color: ${invoiceColors.primary || '#003147'} !important;
          color: #FFFFFF !important;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px;
          border: 1px solid #D1D5DB;
        }
        .invoice-table td {
          padding: 12px 10px;
          border: 1px solid #D1D5DB;
          font-size: 11px;
          background-color: ${invoiceColors.secondary || '#F8F9FA'};
        }
      `}} />

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E5E7EB', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ color: invoiceColors.primary || '#003147', fontSize: '32px', fontWeight: '800', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Invoice</h1>
          <p style={{ margin: '0', color: invoiceColors.primary || '#003147', fontWeight: '500', opacity: 0.8 }}>Official Order Bill Receipt</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <img 
            src={logo} 
            alt="Flora Flowers Logo" 
            style={{ maxHeight: '75px', maxWidth: '200px', objectFit: 'contain' }} 
          />
        </div>
      </div>

      {/* Addresses Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '25px' }}>
        <div>
          <h3 style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '6px' }}>Your Information</h3>
          <p style={{ margin: '0', fontWeight: '700', color: '#1F2937' }}>P2J Mart E-Commerce Inc.</p>
          <p style={{ margin: '3px 0 0 0', color: '#4B5563' }}>{contactData?.address || "123 Gift Street, Joy City"}</p>
          <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>{contactData?.email || "support@p2jmart.com"}</p>
          <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>{contactData?.phones ? contactData.phones.split(',')[0].trim() : "+91-999-888-7777"}</p>
        </div>
        <div>
          <h3 style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '6px' }}>Client Information</h3>
          <p style={{ margin: '0', fontWeight: '700', color: '#1F2937' }}>{order.shippingAddress?.fullName || 'Valued Customer'}</p>
          <p style={{ margin: '3px 0 0 0', color: '#4B5563' }}>{order.shippingAddress?.streetAddress}</p>
          <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}</p>
          {order.shippingAddress?.phone && <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>PH: {order.shippingAddress.phone}</p>}
        </div>
      </div>

      {/* Meta Information */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '25px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
        <div>
          <h3 style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', margin: '0 0 4px 0' }}>Issued On</h3>
          <p style={{ margin: '0', fontWeight: '600', color: '#374151' }}>{formatDate(order.placedDate || order.createdAt)}</p>
        </div>
        <div>
          <h3 style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', margin: '0 0 4px 0' }}>Order ID</h3>
          <p style={{ margin: '0', fontWeight: '700', color: '#374151' }}>{order.orderId || `ORD-${order._id.slice(-8).toUpperCase()}`}</p>
        </div>
      </div>

      {/* Table Section */}
      <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px', border: '1px solid #D1D5DB' }}>
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>S.NO</th>
            <th style={{ textAlign: 'left' }}>ITEM DESCRIPTION</th>
            <th style={{ width: '80px', textAlign: 'center' }}>QUANTITY</th>
            <th style={{ width: '120px', textAlign: 'center' }}>UNIT PRICE</th>
            <th style={{ width: '130px', textAlign: 'right' }}>TOTAL PRICE</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center', color: '#4B5563' }}>{index + 1}</td>
              <td>
                <div style={{ fontWeight: '700', color: '#1F2937' }}>{item.title || item.name}</div>
                
                {/* Options/Variants display */}
                {item.selectedOptions && !item.isComboProduct && (
                  <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                    {Object.entries(item.selectedOptions)
                      .filter(([key]) => !['customImage', 'customText', 'customization'].includes(key))
                      .map(([key, val]) => `${key}: ${val}`).join(', ')}
                  </div>
                )}

                {/* Custom specifications display */}
                {(item.selectedOptions?.customImage || item.selectedOptions?.customText || item.selectedOptions?.customization) && (
                  <div style={{ fontSize: '10px', color: '#EC4899', marginTop: '4px', backgroundColor: '#FDF2F8', padding: '6px', borderRadius: '4px', border: '1px solid #FBCFE8' }}>
                    {(item.selectedOptions?.customImage || item.selectedOptions?.customization?.image) && (
                      <div><span style={{ fontWeight: '700' }}>Custom Photo Attached</span></div>
                    )}
                    {(item.selectedOptions?.customText || item.selectedOptions?.customization?.text) && (
                      <div style={{ fontStyle: 'italic' }}>"{item.selectedOptions.customText || item.selectedOptions.customization?.text}"</div>
                    )}
                  </div>
                )}

                {/* Combo Pack Items display */}
                {item.isComboProduct && item.includedProducts && item.includedProducts.length > 0 && (
                  <div style={{ marginTop: '6px', padding: '6px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: '#047857', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Combo Included Items:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.includedProducts.map((incProd, idx) => (
                        <div key={incProd.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          {incProd.image ? (
                            <img 
                              src={formatImageUrl(incProd.image)} 
                              alt={incProd.title} 
                              style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D1D5DB', flexShrink: 0 }} 
                            />
                          ) : (
                            <div style={{ width: '28px', height: '28px', backgroundColor: '#F3F4F6', borderRadius: '4px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#9CA3AF', flexShrink: 0 }}>N/A</div>
                          )}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '9px', fontWeight: '700', color: '#065F46', lineHeight: '1.3', wordBreak: 'break-word' }}>{incProd.title}</div>
                            <div style={{ fontSize: '8px', color: '#047857', marginTop: '1px' }}>Price: Rs. {Number(incProd.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </td>
              <td style={{ textAlign: 'center', fontWeight: '600', color: '#1F2937' }}>{item.quantity || item.qty}</td>
              <td style={{ textAlign: 'center', color: '#4B5563' }}>Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style={{ textAlign: 'right', fontWeight: '700', color: '#1F2937' }}>Rs. {(Number(item.price) * Number(item.quantity || item.qty || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '20px', paddingRight: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 120px', gap: '10px', textAlign: 'right', color: '#4B5563', fontSize: '13px' }}>
          <span style={{ color: '#9CA3AF', fontWeight: '500' }}>Subtotal:</span>
          <span style={{ fontWeight: '600', color: '#374151' }}>Rs. {Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          
          {order.gst > 0 && (
            <>
              <span style={{ color: '#9CA3AF', fontWeight: '500' }}>GST:</span>
              <span style={{ fontWeight: '600', color: '#374151' }}>Rs. {Number(order.gst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </>
          )}

          <span style={{ color: '#9CA3AF', fontWeight: '500' }}>Shipping:</span>
          <span style={{ fontWeight: '600', color: '#374151' }}>{Number(order.shippingFee || 0) === 0 ? "Free" : `Rs. ${Number(order.shippingFee).toFixed(2)}`}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '150px 120px', gap: '10px', textAlign: 'right', marginTop: '15px', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', color: invoiceColors.primary || '#003147' }}>Total Amount:</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: invoiceColors.primary || '#003147' }}>Rs. {Number(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Authorized Signature */}
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '220px', textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #4B5563', marginBottom: '6px' }}></div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Authorized Signature</span>
        </div>
      </div>

      {/* Bottom Color Banner Section */}
      <div 
        style={{ 
          marginTop: '45px', 
          backgroundColor: invoiceColors.primary || '#003147', 
          color: '#FFFFFF', 
          padding: '14px 18px', 
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', letterSpacing: '0.3px' }}>
          Thank you for choosing P2J MART! We appreciate the opportunity to serve you.
        </p>
        <p style={{ margin: '0', fontSize: '10px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '400', lineHeight: '1.5' }}>
          Please note that payment conditions apply based on terms of billing. If you have any questions or concerns regarding this invoice record statement, feel free to contact us at the provided support email address. We look forward to serving you again in the future.
        </p>
      </div>
    </div>
  );
};

export default OrderInvoice;
