import React, { useState } from 'react';
import Topbar from '../components/layout/Topbar';
import SiteDataModal from '../components/ui/SiteDataModal';

const SiteDataEditor = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Quick search..." />

      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">
          Admin › Site Data Editor
        </p>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-5xl font-bold uppercase">Site Data Management</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="border border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-gray-800"
          >
            Edit Site Data
          </button>
        </div>

        <div className="mt-8">
          <div className="border border-stone-200 bg-white p-8">
            <h2 className="text-2xl font-semibold uppercase mb-4">Site Data Overview</h2>
            <p className="text-gray-600 mb-6">
              Manage all site-wide data including main information, hero section, our story,
              core values, store details, timings, and company information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Main Data</h3>
                <p className="text-sm text-gray-600">Logo, contact info, social media links</p>
              </div>

              <div className="border border-gray-200 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Hero Section</h3>
                <p className="text-sm text-gray-600">Main banner images and subtitle</p>
              </div>

              <div className="border border-gray-200 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Our Story</h3>
                <p className="text-sm text-gray-600">Company description and background</p>
              </div>

              <div className="border border-gray-200 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Core Values</h3>
                <p className="text-sm text-gray-600">Company principles and values</p>
              </div>

              <div className="border border-gray-200 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Our Store</h3>
                <p className="text-sm text-gray-600">Location, contact, and social media</p>
              </div>

              <div className="border border-gray-200 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Our Timings</h3>
                <p className="text-sm text-gray-600">Business hours for weekdays/weekends</p>
              </div>

              <div className="border border-gray-200 p-4 rounded md:col-span-2 lg:col-span-3">
                <h3 className="font-semibold text-lg mb-2">Who Are We</h3>
                <p className="text-sm text-gray-600">Company identity and mission</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                Open Site Data Editor
              </button>
            </div>
          </div>
        </div>
      </section>

      <SiteDataModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default SiteDataEditor;