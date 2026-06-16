import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SiteDataModal from '../components/ui/SiteDataModal';

const Settings = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const siteData = useSelector((state) => state.siteData?.data || {});

  const getSummary = (value, fallback = 'Not configured') => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    if (Array.isArray(value)) return value.length ? `${value.length} items` : fallback;
    return String(value);
  };

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search settings..." />
      <section className="mt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Admin › Settings</p>
            <h1 className="text-4xl font-bold">Website Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-500">
              Manage all website configuration for your storefront, sales, checkout, marketing, legal and client-facing experience.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Open Settings Editor
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Website overview</h2>
                  <p className="mt-1 text-sm text-stone-500">Your current site configuration and quick settings summary.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-700">Site name</div>
                  <div className="mt-2 text-lg font-bold text-stone-900">{getSummary(siteData.websiteName, 'No name')}</div>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-700">Tagline</div>
                  <div className="mt-2 text-lg font-bold text-stone-900">{getSummary(siteData.tagline)}</div>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-700">Primary email</div>
                  <div className="mt-2 text-lg font-bold text-stone-900">{getSummary(siteData.contact?.email)}</div>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-700">Phone</div>
                  <div className="mt-2 text-lg font-bold text-stone-900">{getSummary(siteData.contact?.phone)}</div>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-700">SEO title</div>
                  <div className="mt-2 text-lg font-bold text-stone-900">{getSummary(siteData.seo?.title)}</div>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-700">Analytics</div>
                  <div className="mt-2 text-lg font-bold text-stone-900">{siteData.analytics?.googleTagId ? 'Google Tag active' : getSummary(siteData.analytics?.facebookPixelId)}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-semibold">Checkout settings</h3>
                <p className="mt-2 text-sm text-stone-500">Control checkout behavior and customer experience.</p>
                <div className="mt-6 space-y-3 text-sm text-stone-700">
                  <div>Guests: <span className="font-semibold">{getSummary(siteData.checkout?.allowGuestCheckout)}</span></div>
                  <div>Phone required: <span className="font-semibold">{getSummary(siteData.checkout?.requirePhoneOnCheckout)}</span></div>
                  <div>Terms link: <span className="font-semibold">{getSummary(siteData.checkout?.termsLink)}</span></div>
                </div>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-semibold">Payment settings</h3>
                <p className="mt-2 text-sm text-stone-500">Manage currency and payment options for buyers.</p>
                <div className="mt-6 space-y-3 text-sm text-stone-700">
                  <div>Currency: <span className="font-semibold">{getSummary(siteData.payment?.currency, 'INR')}</span></div>
                  <div>COD enabled: <span className="font-semibold">{getSummary(siteData.payment?.codEnabled)}</span></div>
                  <div>Online payments: <span className="font-semibold">{getSummary(siteData.payment?.onlinePaymentEnabled)}</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6">
              <h3 className="text-lg font-semibold">Shipping settings</h3>
              <p className="mt-2 text-sm text-stone-500">Define shipping rules, free shipping threshold and fulfillment options.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-stone-50 p-4">
                  <div className="text-sm text-stone-500">Default shipping cost</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{getSummary(siteData.shipping?.defaultCost, '₹0')}</div>
                </div>
                <div className="rounded-3xl bg-stone-50 p-4">
                  <div className="text-sm text-stone-500">Free shipping threshold</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{getSummary(siteData.shipping?.freeShippingThreshold, '₹0')}</div>
                </div>
                <div className="rounded-3xl bg-stone-50 p-4">
                  <div className="text-sm text-stone-500">Handling time</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{getSummary(siteData.shipping?.handlingTime)}</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6">
              <h3 className="text-lg font-semibold">Quick actions</h3>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setModalOpen(true)}
                  className="block w-full rounded-3xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  Edit all settings
                </button>
                <button
                  onClick={() => navigate('/site-data')}
                  className="block w-full rounded-3xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Open Site Data management
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6">
              <h3 className="text-lg font-semibold">Legal & policy</h3>
              <p className="mt-2 text-sm text-stone-500">Maintain privacy, terms, and footer links for compliance.</p>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                <div>Footer text: <span className="font-semibold">{getSummary(siteData.footerText)}</span></div>
                <div>Links: <span className="font-semibold">{getSummary(siteData.legalLinks)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteDataModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Settings;
