import React from 'react';
import PageHeader from '../../components/PageHeader';

const ComboPack = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Combo Pack"
        subtitle="Manage custom product combo bundles and special curation offers."
      />
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <p className="text-sm text-gray-500 font-medium">Combo Packs and bundled products list dashboard.</p>
      </div>
    </div>
  );
};

export default ComboPack;
