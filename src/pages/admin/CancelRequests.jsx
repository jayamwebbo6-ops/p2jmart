import React from 'react';
import PageHeader from '../../components/PageHeader';

const CancelRequests = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancel Requests (Buyer)"
        subtitle="Review, approve, or reject order cancellation requests submitted by customers."
      />
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <p className="text-sm text-gray-500 font-medium">Customer order cancellation requests list and queue management.</p>
      </div>
    </div>
  );
};

export default CancelRequests;
