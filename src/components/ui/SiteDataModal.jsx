import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../config/api';
import { fetchSiteData, updateSiteData } from '../../Redux/thunks/siteDataThunks';
import SiteDataSection from './SiteDataSection';
import SiteDataRepeater from './SiteDataRepeater';

const adLocations = ['all', 'home', 'collection', 'product', 'cart', 'checkout'];

const defaultSiteData = {
  websiteName: '',
  logoUrl: '',
  faviconUrl: '',
  tagline: '',
  hero: {
    title: '',
    subtitle: '',
    ctaLabel: '',
    ctaPath: '',
    location: 'home',
    imageDesktop: '',
    imageMobile: '',
  },
  topOffers: [],
  advertisements: [],
  about: {
    heroImage: '',
    visionHeading: 'The Vision',
    visionStatement: '',
    visionDescription: '',
    coreValues: {
      heading: 'Core Values',
      values: [],
    },
    founder: {
      name: '',
      role: '',
      quote: '',
      image: '',
      establishmentTag: '',
    },
  },
  contact: {
    heading: '',
    subheading: '',
    email: '',
    phone: '',
    address: '',
    workingHours: [],
    socials: [],
  },
  seo: {
    title: '',
    description: '',
    keywords: '',
    metaImage: '',
  },
  payment: {
    currency: 'INR',
    codEnabled: true,
    onlinePaymentEnabled: true,
    paymentInstructions: '',
    paymentOptions: [
      { id: 'razorpay', label: 'Secure Payment (Razorpay)', description: 'Supports cards, UPI, net banking & wallets.', enabled: true },
      { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order.', enabled: true }
    ]
  },
  shipping: {
    defaultCost: 0,
    freeShippingThreshold: 0,
    handlingTime: '',
    methods: [],
  },
  checkout: {
    allowGuestCheckout: true,
    requirePhoneOnCheckout: true,
    termsLink: '',
    supportEmail: '',
  },
  analytics: {
    googleTagId: '',
    facebookPixelId: '',
  },
  navigationLinks: [],
  legalLinks: [],
  footerText: '',
  authData: {
    loginText: '',
    registerText: '',
    headingText: '',
    subHeadingText: '',
  },
};

const getSiteDataState = (data = {}) => ({
  websiteName: data.websiteName || '',
  logoUrl: data.logoUrl || '',
  faviconUrl: data.faviconUrl || '',
  tagline: data.tagline || '',
  hero: {
    ...defaultSiteData.hero,
    ...(data.hero || {}),
  },
  topOffers: Array.isArray(data.topOffers) ? data.topOffers : [],
  advertisements: Array.isArray(data.advertisements)
    ? data.advertisements.map((ad) => ({
        title: ad.title || '',
        description: ad.description || '',
        imageUrl: ad.imageUrl || '',
        link: ad.link || '',
        location: ad.location || 'all',
        buttonText: ad.buttonText || '',
      }))
    : [],
  about: {
    heroImage: data.about?.heroImage || '',
    visionHeading: data.about?.visionHeading || 'The Vision',
    visionStatement: data.about?.visionStatement || '',
    visionDescription: data.about?.visionDescription || '',
    coreValues: {
      heading: data.about?.coreValues?.heading || 'Core Values',
      values: Array.isArray(data.about?.coreValues?.values) ? data.about.coreValues.values : [],
    },
    founder: {
      ...defaultSiteData.about.founder,
      ...(data.about?.founder || {}),
    },
  },
  contact: {
    heading: data.contact?.heading || '',
    subheading: data.contact?.subheading || '',
    email: data.contact?.email || '',
    phone: data.contact?.phone || '',
    address: data.contact?.address || '',
    workingHours: Array.isArray(data.contact?.workingHours) ? data.contact.workingHours : [],
    socials: Array.isArray(data.contact?.socials) ? data.contact.socials : [],
  },
  seo: {
    title: data.seo?.title || '',
    description: data.seo?.description || '',
    keywords: data.seo?.keywords || '',
    metaImage: data.seo?.metaImage || '',
  },
  payment: {
    currency: data.payment?.currency || 'INR',
    codEnabled: data.payment?.codEnabled ?? true,
    onlinePaymentEnabled: data.payment?.onlinePaymentEnabled ?? true,
    paymentInstructions: data.payment?.paymentInstructions || '',
    paymentOptions: Array.isArray(data.payment?.paymentOptions)
      ? data.payment.paymentOptions.map((option) => ({
          id: option.id || '',
          label: option.label || '',
          description: option.description || '',
          enabled: option.enabled ?? true,
        }))
      : [
          { id: 'razorpay', label: 'Secure Payment (Razorpay)', description: 'Supports cards, UPI, net banking & wallets.', enabled: true },
          { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order.', enabled: true }
        ]
  },
  shipping: {
    defaultCost: Number(data.shipping?.defaultCost || 0),
    freeShippingThreshold: Number(data.shipping?.freeShippingThreshold || 0),
    handlingTime: data.shipping?.handlingTime || '',
    methods: Array.isArray(data.shipping?.methods) ? data.shipping.methods : [],
  },
  checkout: {
    allowGuestCheckout: data.checkout?.allowGuestCheckout ?? true,
    requirePhoneOnCheckout: data.checkout?.requirePhoneOnCheckout ?? true,
    termsLink: data.checkout?.termsLink || '',
    supportEmail: data.checkout?.supportEmail || '',
  },
  analytics: {
    googleTagId: data.analytics?.googleTagId || '',
    facebookPixelId: data.analytics?.facebookPixelId || '',
  },
  navigationLinks: Array.isArray(data.navigationLinks) ? data.navigationLinks : [],
  legalLinks: Array.isArray(data.legalLinks)
    ? data.legalLinks.map((item) => ({
        name: item.name || '',
        link: item.link || '',
        subtitle: item.subtitle || '',
        highlight: item.highlight || '',
        methods: Array.isArray(item.methods) ? item.methods : [],
        sections: Array.isArray(item.sections) ? item.sections : [],
      }))
    : [],
  footerText: data.footerText || '',
  authData: {
    ...defaultSiteData.authData,
    ...(data.authData || {}),
  },
});

const SiteDataModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { data: siteData, isLoading, error } = useSelector((state) => state.siteData);
  const [activeTab, setActiveTab] = useState('main');
  const [formData, setFormData] = useState(getSiteDataState());
  const [originalFormData, setOriginalFormData] = useState(getSiteDataState());
  const [saveError, setSaveError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  const buildDottedPayload = (path, value) => ({ [path]: value });

  const getNestedValue = (path, source = formData) => {
    return path.reduce((current, key) => (current && Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined), source);
  };

  const handleImageUpload = async (fieldPath, file) => {
    if (!file) return;
    const path = fieldPath.split('.');
    const previousUrl = getNestedValue(path);
    setUploadingFiles((prev) => ({ ...prev, [fieldPath]: true }));
    setSaveError('');

    try {
      const uploadForm = new FormData();
      uploadForm.append('image', file);
      if (previousUrl) uploadForm.append('prevUrl', previousUrl);
      const response = await api.post('/site/upload', uploadForm);
      const imageUrl = response?.data?.url;

      if (!imageUrl) {
        throw new Error(response?.data?.error || 'Upload failed');
      }

      updateNestedState(path, imageUrl);
      await dispatch(updateSiteData(buildDottedPayload(fieldPath, imageUrl))).unwrap();
    } catch (error) {
      setSaveError(error?.response?.data?.error || error.message || 'Image upload failed');
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldPath]: false }));
    }
  };

  const handleArrayImageUpload = async (path, index, field, file) => {
    if (!file) return;
    const uploadKey = `${path.join('.')}.${index}.${field}`;
    const previousUrl = getNestedValue([...path, index, field]);
    setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }));
    setSaveError('');

    try {
      const uploadForm = new FormData();
      uploadForm.append('image', file);
      if (previousUrl) uploadForm.append('prevUrl', previousUrl);
      const response = await api.post('/site/upload', uploadForm);
      const imageUrl = response?.data?.url;

      if (!imageUrl) {
        throw new Error(response?.data?.error || 'Upload failed');
      }

      updateArrayItem(path, index, field, imageUrl);
      const dottedPath = `${path.join('.')}.${index}.${field}`;
      await dispatch(updateSiteData(buildDottedPayload(dottedPath, imageUrl))).unwrap();
    } catch (error) {
      setSaveError(error?.response?.data?.error || error.message || 'Image upload failed');
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSiteData());
      setSaveError('');
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && siteData) {
      const normalized = getSiteDataState(siteData);
      setFormData(normalized);
      setOriginalFormData(normalized);
    }
  }, [isOpen, siteData]);

  // Build a flat dotted-path diff between original and current
  const buildDiffPayload = (orig, curr, prefix = '') => {
    const changes = {};

    const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

    const keys = new Set([...Object.keys(orig || {}), ...Object.keys(curr || {})]);

    for (const key of keys) {
      const a = orig ? orig[key] : undefined;
      const b = curr ? curr[key] : undefined;
      const path = prefix ? `${prefix}.${key}` : key;

      if (isObject(a) && isObject(b)) {
        const child = buildDiffPayload(a, b, path);
        Object.assign(changes, child);
        continue;
      }

      // Arrays: compare by JSON string
      if (Array.isArray(a) || Array.isArray(b)) {
        const sa = Array.isArray(a) ? JSON.stringify(a) : undefined;
        const sb = Array.isArray(b) ? JSON.stringify(b) : undefined;
        if (sa !== sb) {
          changes[path] = b === undefined ? null : b;
        }
        continue;
      }

      // Primitives and mismatched types
      if (a === undefined && b !== undefined) {
        changes[path] = b;
      } else if (b === undefined && a !== undefined) {
        changes[path] = null;
      } else if (a !== b) {
        changes[path] = b;
      }
    }

    return changes;
  };

  const updateNestedState = (path, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      let current = next;

      path.forEach((key, index) => {
        const isLast = index === path.length - 1;
        if (isLast) {
          current[key] = value;
          return;
        }

        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
      });

      return next;
    });
  };

  const addArrayItem = (path, item) => {
    setFormData((prev) => {
      const next = { ...prev };
      let current = next;
      path.forEach((key, index) => {
        const isLast = index === path.length - 1;
        if (isLast) {
          const array = Array.isArray(current[key]) ? [...current[key], item] : [item];
          current[key] = array;
          return;
        }
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
      });
      return next;
    });
  };

  const updateArrayItem = (path, index, field, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      let current = next;
      path.forEach((key, pathIndex) => {
        const isLast = pathIndex === path.length - 1;
        if (isLast) {
          const array = Array.isArray(current[key]) ? [...current[key]] : [];
          array[index] = { ...array[index], [field]: value };
          current[key] = array;
          return;
        }
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
      });
      return next;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData((prev) => {
      const next = { ...prev };
      let current = next;
      path.forEach((key, pathIndex) => {
        const isLast = pathIndex === path.length - 1;
        if (isLast) {
          const array = Array.isArray(current[key]) ? [...current[key]] : [];
          array.splice(index, 1);
          current[key] = array;
          return;
        }
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
      });
      return next;
    });
  };

  const handleSave = async () => {
    setSaveError('');
    try {
      const cleanedFormData = { ...formData };
      if (cleanedFormData.hero) {
        cleanedFormData.hero = {
          title: cleanedFormData.hero.title || '',
          subtitle: cleanedFormData.hero.subtitle || '',
          ctaLabel: cleanedFormData.hero.ctaLabel || '',
          ctaPath: cleanedFormData.hero.ctaPath || '',
          location: cleanedFormData.hero.location || 'home',
          imageDesktop: cleanedFormData.hero.imageDesktop || '',
          imageMobile: cleanedFormData.hero.imageMobile || '',
        };
      }
      // Build minimal diff payload (dotted keys) between original and cleaned current
      const origClean = originalFormData || {};
      const diffPayload = buildDiffPayload(origClean, cleanedFormData);

      if (!diffPayload || Object.keys(diffPayload).length === 0) {
        setSaveError('No changes detected');
        return;
      }

      const result = await dispatch(updateSiteData(diffPayload)).unwrap();
      if (result && result.pending) {
        setOtpMessage(result.message || 'OTP sent to your email');
        setOtpVisible(true);
        return;
      }

      onClose();
    } catch (err) {
      setSaveError(err?.message || 'Unable to save site data.');
    }
  };

  const handleConfirmOtp = async () => {
    setOtpError('');
    try {
      const { data } = await api.post('/site/confirm', { otp: otpValue });
      if (data?.success) {
        // Refresh site data and close
        await dispatch(fetchSiteData());
        setOtpVisible(false);
        onClose();
      } else {
        setOtpError(data?.error || 'OTP validation failed');
      }
    } catch (err) {
      setOtpError(err?.response?.data?.error || err.message || 'OTP confirmation failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-stone-900">Edit Site Data</h2>
            <p className="mt-1 text-sm text-stone-500">Manage global UI content and Redis-backed metadata.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-0 overflow-hidden">
          <aside className="w-72 border-r border-stone-200 bg-stone-50 p-5 overflow-y-auto">
            <div className="space-y-3">
              {[
                { id: 'main', label: 'Main' },
                { id: 'seo', label: 'SEO' },
                { id: 'hero', label: 'Hero' },
                { id: 'topOffers', label: 'Offers' },
                { id: 'advertisements', label: 'Advertisements' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
                { id: 'payment', label: 'Payment' },
                { id: 'checkout', label: 'Checkout' },
                { id: 'shipping', label: 'Shipping' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'navigationLinks', label: 'Navigation' },
                { id: 'legalLinks', label: 'Legal' },
                { id: 'authData', label: 'Auth' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`block w-full rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-6">
            {saveError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 mb-5">
                {saveError}
              </div>
            ) : null}

            <SiteDataSection className={activeTab === 'main' ? '' : 'hidden'} title="Global Site Settings" subtitle="Logo, titles and branding.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Website Name</label>
                  <input
                    type="text"
                    value={formData.websiteName}
                    onChange={(e) => updateNestedState(['websiteName'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => updateNestedState(['tagline'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Footer Text</label>
                  <textarea
                    value={formData.footerText}
                    onChange={(e) => updateNestedState(['footerText'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Logo</label>
                  <div className="mt-2 space-y-3">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo preview" className="h-16 w-auto rounded-lg border border-stone-200 object-contain" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logoUrl', e.target.files?.[0])}
                      className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                    />
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => updateNestedState(['logoUrl'], e.target.value)}
                      placeholder="Logo URL (optional if uploading)"
                      className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                    {uploadingFiles.logoUrl ? (
                      <p className="text-sm text-stone-500">Uploading logo...</p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Favicon</label>
                  <div className="mt-2 space-y-3">
                    {formData.faviconUrl ? (
                      <img src={formData.faviconUrl} alt="Favicon preview" className="h-10 w-10 rounded border border-stone-200 object-contain" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('faviconUrl', e.target.files?.[0])}
                      className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                    />
                    <input
                      type="text"
                      value={formData.faviconUrl}
                      onChange={(e) => updateNestedState(['faviconUrl'], e.target.value)}
                      placeholder="Favicon URL (optional if uploading)"
                      className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                    {uploadingFiles.faviconUrl ? (
                      <p className="text-sm text-stone-500">Uploading favicon...</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </SiteDataSection>

            {otpVisible ? (
              <div className="fixed inset-0 z-60 flex items-center justify-center">
                <div className="bg-black/40 absolute inset-0" />
                <div className="relative z-70 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <h3 className="text-lg font-semibold">Confirm Site Update</h3>
                  <p className="mt-2 text-sm text-stone-600">{otpMessage || 'Enter the OTP sent to your admin email to confirm changes.'}</p>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="mt-4 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                  />
                  {otpError ? <p className="mt-2 text-sm text-rose-600">{otpError}</p> : null}
                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setOtpVisible(false)} className="rounded-3xl border px-4 py-2">Cancel</button>
                    <button type="button" onClick={handleConfirmOtp} className="rounded-3xl bg-black px-4 py-2 text-white">Confirm</button>
                  </div>
                </div>
              </div>
            ) : null}

            <SiteDataSection className={activeTab === 'hero' ? '' : 'hidden'} title="Hero Section" subtitle="Primary homepage hero content.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Headline</label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={(e) => updateNestedState(['hero', 'title'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Subtitle</label>
                  <input
                    type="text"
                    value={formData.hero.subtitle}
                    onChange={(e) => updateNestedState(['hero', 'subtitle'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Button Label</label>
                  <input
                    type="text"
                    value={formData.hero.ctaLabel}
                    onChange={(e) => updateNestedState(['hero', 'ctaLabel'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Button Link</label>
                  <input
                    type="text"
                    value={formData.hero.ctaPath}
                    onChange={(e) => updateNestedState(['hero', 'ctaPath'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Hero Location</label>
                  <select
                    value={formData.hero.location || 'home'}
                    onChange={(e) => updateNestedState(['hero', 'location'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    {adLocations.map((location) => (
                      <option key={location} value={location}>
                        {location === 'all' ? 'All pages' : location.charAt(0).toUpperCase() + location.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Desktop Image</label>
                  <div className="mt-2 space-y-3">
                    {formData.hero.imageDesktop ? (
                      <img src={formData.hero.imageDesktop} alt="Hero desktop preview" className="h-auto w-full rounded-lg border border-stone-200 object-cover" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('hero.imageDesktop', e.target.files?.[0])}
                      className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                    />
                    <input
                      type="text"
                      value={formData.hero.imageDesktop}
                      onChange={(e) => updateNestedState(['hero', 'imageDesktop'], e.target.value)}
                      placeholder="Desktop image URL (optional if uploading)"
                      className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                    {uploadingFiles['hero.imageDesktop'] ? (
                      <p className="text-sm text-stone-500">Uploading desktop hero image...</p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Mobile Image</label>
                  <div className="mt-2 space-y-3">
                    {formData.hero.imageMobile ? (
                      <img src={formData.hero.imageMobile} alt="Hero mobile preview" className="h-auto w-full rounded-lg border border-stone-200 object-cover" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('hero.imageMobile', e.target.files?.[0])}
                      className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                    />
                    <input
                      type="text"
                      value={formData.hero.imageMobile}
                      onChange={(e) => updateNestedState(['hero', 'imageMobile'], e.target.value)}
                      placeholder="Mobile image URL (optional if uploading)"
                      className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                    {uploadingFiles['hero.imageMobile'] ? (
                      <p className="text-sm text-stone-500">Uploading mobile hero image...</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'topOffers' ? '' : 'hidden'} title="Top Offers" subtitle="Promotional site offers.">
              <SiteDataRepeater
                title="Offer"
                items={formData.topOffers}
                addLabel="Add Offer"
                emptyLabel="No offers added yet."
                onAdd={() => addArrayItem(['topOffers'], { title: '', description: '', code: '' })}
                onRemove={(index) => removeArrayItem(['topOffers'], index)}
                renderItem={(item, index) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Title</label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => updateArrayItem(['topOffers'], index, 'title', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Description</label>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateArrayItem(['topOffers'], index, 'description', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Code</label>
                      <input
                        type="text"
                        value={item.code || ''}
                        onChange={(e) => updateArrayItem(['topOffers'], index, 'code', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                )}
              />
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'advertisements' ? '' : 'hidden'} title="Advertisements" subtitle="Ads displayed across the storefront.">
              <SiteDataRepeater
                title="Advertisement"
                items={formData.advertisements}
                addLabel="Add Ad"
                emptyLabel="No advertisements added yet."
                onAdd={() => addArrayItem(['advertisements'], { title: '', description: '', imageUrl: '', link: '', location: 'all' , buttonText: '' })}
                onRemove={(index) => removeArrayItem(['advertisements'], index)}
                renderItem={(item, index) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Title</label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => updateArrayItem(['advertisements'], index, 'title', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Description</label>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateArrayItem(['advertisements'], index, 'description', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Button Text</label>
                      <input
                        type="text"
                        value={item.buttonText || ''}
                        onChange={(e) => updateArrayItem(['advertisements'], index, 'buttonText', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Image</label>
                      <div className="mt-2 space-y-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={`Ad ${index + 1}`} className="h-28 w-full rounded-lg border border-stone-200 object-cover" />
                        ) : null}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleArrayImageUpload(['advertisements'], index, 'imageUrl', e.target.files?.[0])}
                          className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                        />
                        <input
                          type="text"
                          value={item.imageUrl || ''}
                          onChange={(e) => updateArrayItem(['advertisements'], index, 'imageUrl', e.target.value)}
                          placeholder="Image URL (optional if uploading)"
                          className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                        {uploadingFiles[`advertisements.${index}.imageUrl`] ? (
                          <p className="text-sm text-stone-500">Uploading advertisement image...</p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Link</label>
                      <input
                        type="text"
                        value={item.link || ''}
                        onChange={(e) => updateArrayItem(['advertisements'], index, 'link', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Placement</label>
                      <select
                        value={item.location || 'all'}
                        onChange={(e) => updateArrayItem(['advertisements'], index, 'location', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-black"
                      >
                        {adLocations.map((location) => (
                          <option key={location} value={location}>
                            {location === 'all' ? 'All pages' : location.charAt(0).toUpperCase() + location.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              />
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'about' ? '' : 'hidden'} title="About Section" subtitle="Brand story and founder details.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Hero Image</label>
                  <div className="mt-2 space-y-3">
                    {formData.about.heroImage ? (
                      <img src={formData.about.heroImage} alt="About hero preview" className="h-40 w-full rounded-lg border border-stone-200 object-cover" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('about.heroImage', e.target.files?.[0])}
                      className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                    />
                    <input
                      type="text"
                      value={formData.about.heroImage}
                      onChange={(e) => updateNestedState(['about', 'heroImage'], e.target.value)}
                      placeholder="About hero image URL (optional if uploading)"
                      className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                    {uploadingFiles['about.heroImage'] ? (
                      <p className="text-sm text-stone-500">Uploading about hero image...</p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Vision Heading</label>
                  <input
                    type="text"
                    value={formData.about.visionHeading}
                    onChange={(e) => updateNestedState(['about', 'visionHeading'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Vision Statement</label>
                  <textarea
                    value={formData.about.visionStatement}
                    onChange={(e) => updateNestedState(['about', 'visionStatement'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Vision Description</label>
                  <textarea
                    value={formData.about.visionDescription}
                    onChange={(e) => updateNestedState(['about', 'visionDescription'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Core Values Heading</label>
                  <input
                    type="text"
                    value={formData.about.coreValues.heading}
                    onChange={(e) => updateNestedState(['about', 'coreValues', 'heading'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <SiteDataRepeater
                title="Core Value"
                items={formData.about.coreValues.values}
                addLabel="Add Core Value"
                emptyLabel="No core values added yet."
                onAdd={() => addArrayItem(['about', 'coreValues', 'values'], { image: '', alt: '' })}
                onRemove={(index) => removeArrayItem(['about', 'coreValues', 'values'], index)}
                renderItem={(item, index) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Image</label>
                      <div className="mt-2 space-y-3">
                        {item.image ? (
                          <img src={item.image} alt={`Core value ${index + 1}`} className="h-auto w-full rounded-lg border border-stone-200 object-cover" />
                        ) : null}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleArrayImageUpload(['about', 'coreValues', 'values'], index, 'image', e.target.files?.[0])}
                          className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                        />
                        <input
                          type="text"
                          value={item.image || ''}
                          onChange={(e) => updateArrayItem(['about', 'coreValues', 'values'], index, 'image', e.target.value)}
                          placeholder="Image URL (optional if uploading)"
                          className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                        {uploadingFiles[`about.coreValues.values.${index}.image`] ? (
                          <p className="text-sm text-stone-500">Uploading core value image...</p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Alt Text</label>
                      <input
                        type="text"
                        value={item.alt || ''}
                        onChange={(e) => updateArrayItem(['about', 'coreValues', 'values'], index, 'alt', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                )}
              />

              <SiteDataSection title="Founder" subtitle="Founder profile information.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-stone-700">Name</label>
                    <input
                      type="text"
                      value={formData.about.founder.name}
                      onChange={(e) => updateNestedState(['about', 'founder', 'name'], e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Role</label>
                    <input
                      type="text"
                      value={formData.about.founder.role}
                      onChange={(e) => updateNestedState(['about', 'founder', 'role'], e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-stone-700">Quote</label>
                    <textarea
                      value={formData.about.founder.quote}
                      onChange={(e) => updateNestedState(['about', 'founder', 'quote'], e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Founder Image</label>
                    <div className="mt-2 space-y-3">
                      {formData.about.founder.image ? (
                        <img src={formData.about.founder.image} alt="Founder preview" className="h-32 w-full rounded-lg border border-stone-200 object-cover" />
                      ) : null}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('about.founder.image', e.target.files?.[0])}
                        className="block w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700"
                      />
                      <input
                        type="text"
                        value={formData.about.founder.image}
                        onChange={(e) => updateNestedState(['about', 'founder', 'image'], e.target.value)}
                        placeholder="Founder image URL (optional if uploading)"
                        className="w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                      {uploadingFiles['about.founder.image'] ? (
                        <p className="text-sm text-stone-500">Uploading founder image...</p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Establishment Tag</label>
                    <input
                      type="text"
                      value={formData.about.founder.establishmentTag}
                      onChange={(e) => updateNestedState(['about', 'founder', 'establishmentTag'], e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </SiteDataSection>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'contact' ? '' : 'hidden'} title="Contact" subtitle="Store contact details and social links.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Heading</label>
                  <input
                    type="text"
                    value={formData.contact.heading}
                    onChange={(e) => updateNestedState(['contact', 'heading'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Subheading</label>
                  <input
                    type="text"
                    value={formData.contact.subheading}
                    onChange={(e) => updateNestedState(['contact', 'subheading'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Email</label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => updateNestedState(['contact', 'email'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Phone</label>
                  <input
                    type="text"
                    value={formData.contact.phone}
                    onChange={(e) => updateNestedState(['contact', 'phone'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Address</label>
                  <textarea
                    value={formData.contact.address}
                    onChange={(e) => updateNestedState(['contact', 'address'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    rows={3}
                  />
                </div>
              </div>

              <SiteDataRepeater
                title="Working Hour"
                items={formData.contact.workingHours}
                addLabel="Add Timing"
                emptyLabel="No business hours added yet."
                onAdd={() => addArrayItem(['contact', 'workingHours'], { day: '', hours: '' })}
                onRemove={(index) => removeArrayItem(['contact', 'workingHours'], index)}
                renderItem={(item, index) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Day</label>
                      <input
                        type="text"
                        value={item.day || ''}
                        onChange={(e) => updateArrayItem(['contact', 'workingHours'], index, 'day', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Hours</label>
                      <input
                        type="text"
                        value={item.hours || ''}
                        onChange={(e) => updateArrayItem(['contact', 'workingHours'], index, 'hours', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                )}
              />

              <SiteDataRepeater
                title="Social Link"
                items={formData.contact.socials}
                addLabel="Add Social"
                emptyLabel="No social links added yet."
                onAdd={() => addArrayItem(['contact', 'socials'], { label: '', url: '' })}
                onRemove={(index) => removeArrayItem(['contact', 'socials'], index)}
                renderItem={(item, index) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Label</label>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) => updateArrayItem(['contact', 'socials'], index, 'label', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">URL</label>
                      <input
                        type="text"
                        value={item.url || ''}
                        onChange={(e) => updateArrayItem(['contact', 'socials'], index, 'url', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                )}
              />
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'seo' ? '' : 'hidden'} title="SEO Settings" subtitle="Search engine title, description and meta tags.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seo.title}
                    onChange={(e) => updateNestedState(['seo', 'title'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Keywords</label>
                  <input
                    type="text"
                    value={formData.seo.keywords}
                    onChange={(e) => updateNestedState(['seo', 'keywords'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.seo.description}
                    onChange={(e) => updateNestedState(['seo', 'description'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Meta image URL</label>
                  <input
                    type="text"
                    value={formData.seo.metaImage}
                    onChange={(e) => updateNestedState(['seo', 'metaImage'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'payment' ? '' : 'hidden'} title="Payment Settings" subtitle="Payment modes and currency configuration.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Currency</label>
                  <input
                    type="text"
                    value={formData.payment.currency}
                    onChange={(e) => updateNestedState(['payment', 'currency'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Cash on Delivery</label>
                  <select
                    value={String(formData.payment.codEnabled)}
                    onChange={(e) => updateNestedState(['payment', 'codEnabled'], e.target.value === 'true')}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Online payments</label>
                  <select
                    value={String(formData.payment.onlinePaymentEnabled)}
                    onChange={(e) => updateNestedState(['payment', 'onlinePaymentEnabled'], e.target.value === 'true')}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Payment instructions</label>
                  <textarea
                    rows={3}
                    value={formData.payment.paymentInstructions}
                    onChange={(e) => updateNestedState(['payment', 'paymentInstructions'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-4 rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm text-stone-600">Payment method IDs are fixed. Update only the button label, description, and active state here.</p>
                </div>
                {formData.payment.paymentOptions?.length > 0 ? (
                  <div className="space-y-4">
                    {formData.payment.paymentOptions.map((item, index) => (
                      <div key={item.id || index} className="rounded-3xl border border-stone-200 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-stone-700">Method ID</label>
                            <input
                              type="text"
                              value={item.id || ''}
                              disabled
                              className="mt-2 w-full rounded-3xl border border-stone-300 bg-stone-100 px-4 py-3 text-stone-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-stone-700">Enabled</label>
                            <select
                              value={String(item.enabled ?? true)}
                              onChange={(e) => updateArrayItem(['payment', 'paymentOptions'], index, 'enabled', e.target.value === 'true')}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                            >
                              <option value="true">Enabled</option>
                              <option value="false">Disabled</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-stone-700">Payment Label</label>
                            <input
                              type="text"
                              value={item.label || ''}
                              onChange={(e) => updateArrayItem(['payment', 'paymentOptions'], index, 'label', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                              placeholder="Secure Payment (Razorpay)"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-stone-700">Description</label>
                            <textarea
                              rows={2}
                              value={item.description || ''}
                              onChange={(e) => updateArrayItem(['payment', 'paymentOptions'], index, 'description', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                              placeholder="Supports cards, UPI, net banking & wallets."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
                    No payment options configured. Please set the default payment methods in code.
                  </div>
                )}
              </div>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'checkout' ? '' : 'hidden'} title="Checkout Settings" subtitle="Customer checkout experience and support options.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Allow guest checkout</label>
                  <select
                    value={String(formData.checkout.allowGuestCheckout)}
                    onChange={(e) => updateNestedState(['checkout', 'allowGuestCheckout'], e.target.value === 'true')}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="true">Allowed</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Require phone on checkout</label>
                  <select
                    value={String(formData.checkout.requirePhoneOnCheckout)}
                    onChange={(e) => updateNestedState(['checkout', 'requirePhoneOnCheckout'], e.target.value === 'true')}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="true">Required</option>
                    <option value="false">Optional</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Terms & conditions link</label>
                  <input
                    type="text"
                    value={formData.checkout.termsLink}
                    onChange={(e) => updateNestedState(['checkout', 'termsLink'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Support email</label>
                  <input
                    type="email"
                    value={formData.checkout.supportEmail}
                    onChange={(e) => updateNestedState(['checkout', 'supportEmail'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'shipping' ? '' : 'hidden'} title="Shipping Settings" subtitle="Shipping cost, free delivery rules and delivery methods.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Default shipping cost</label>
                  <input
                    type="number"
                    value={formData.shipping.defaultCost}
                    onChange={(e) => updateNestedState(['shipping', 'defaultCost'], Number(e.target.value))}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Free shipping threshold</label>
                  <input
                    type="number"
                    value={formData.shipping.freeShippingThreshold}
                    onChange={(e) => updateNestedState(['shipping', 'freeShippingThreshold'], Number(e.target.value))}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Handling time</label>
                  <input
                    type="text"
                    value={formData.shipping.handlingTime}
                    onChange={(e) => updateNestedState(['shipping', 'handlingTime'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="mt-6">
                <SiteDataRepeater
                  title="Shipping method"
                  items={formData.shipping.methods}
                  addLabel="Add Method"
                  emptyLabel="No shipping methods added yet."
                  onAdd={() => addArrayItem(['shipping', 'methods'], { type: '', time: '' })}
                  onRemove={(index) => removeArrayItem(['shipping', 'methods'], index)}
                  renderItem={(item, index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-stone-700">Method</label>
                        <input
                          type="text"
                          value={item.type || ''}
                          onChange={(e) => updateArrayItem(['shipping', 'methods'], index, 'type', e.target.value)}
                          className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-stone-700">Delivery time</label>
                        <input
                          type="text"
                          value={item.time || ''}
                          onChange={(e) => updateArrayItem(['shipping', 'methods'], index, 'time', e.target.value)}
                          className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  )}
                />
              </div>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'analytics' ? '' : 'hidden'} title="Analytics" subtitle="Tracking IDs and performance measurement.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Google Tag ID</label>
                  <input
                    type="text"
                    value={formData.analytics.googleTagId}
                    onChange={(e) => updateNestedState(['analytics', 'googleTagId'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={formData.analytics.facebookPixelId}
                    onChange={(e) => updateNestedState(['analytics', 'facebookPixelId'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'navigationLinks' ? '' : 'hidden'} title="Navigation Links" subtitle="Update primary menu links.">
              <SiteDataRepeater
                title="Navigation Item"
                items={formData.navigationLinks}
                addLabel="Add Link"
                emptyLabel="No navigation links configured yet."
                onAdd={() => addArrayItem(['navigationLinks'], { label: '', path: '' })}
                onRemove={(index) => removeArrayItem(['navigationLinks'], index)}
                renderItem={(item, index) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Label</label>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) => updateArrayItem(['navigationLinks'], index, 'label', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Path</label>
                      <input
                        type="text"
                        value={item.path || ''}
                        onChange={(e) => updateArrayItem(['navigationLinks'], index, 'path', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                )}
              />
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'legalLinks' ? '' : 'hidden'} title="Legal Links" subtitle="Create footer/legal documents and sections.">
              <SiteDataRepeater
                title="Legal Document"
                items={formData.legalLinks}
                addLabel="Add Legal Document"
                emptyLabel="No legal documents configured yet."
                onAdd={() => addArrayItem(['legalLinks'], { name: '', link: '', subtitle: '', highlight: '', methods: [], sections: [] })}
                onRemove={(index) => removeArrayItem(['legalLinks'], index)}
                renderItem={(item, index) => (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-stone-700">Name</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => updateArrayItem(['legalLinks'], index, 'name', e.target.value)}
                          className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-stone-700">Link</label>
                        <input
                          type="text"
                          value={item.link || ''}
                          onChange={(e) => updateArrayItem(['legalLinks'], index, 'link', e.target.value)}
                          className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-stone-700">Subtitle</label>
                        <input
                          type="text"
                          value={item.subtitle || ''}
                          onChange={(e) => updateArrayItem(['legalLinks'], index, 'subtitle', e.target.value)}
                          className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-stone-700">Highlight</label>
                        <input
                          type="text"
                          value={item.highlight || ''}
                          onChange={(e) => updateArrayItem(['legalLinks'], index, 'highlight', e.target.value)}
                          className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <SiteDataRepeater
                      title="Method"
                      items={item.methods || []}
                      addLabel="Add Method"
                      emptyLabel="No methods added yet."
                      onAdd={() => addArrayItem(['legalLinks', index, 'methods'], { type: '', time: '' })}
                      onRemove={(methodIndex) => removeArrayItem(['legalLinks', index, 'methods'], methodIndex)}
                      renderItem={(method, methodIndex) => (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-stone-700">Type</label>
                            <input
                              type="text"
                              value={method.type || ''}
                              onChange={(e) => updateArrayItem(['legalLinks', index, 'methods'], methodIndex, 'type', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-stone-700">Time</label>
                            <input
                              type="text"
                              value={method.time || ''}
                              onChange={(e) => updateArrayItem(['legalLinks', index, 'methods'], methodIndex, 'time', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                            />
                          </div>
                        </div>
                      )}
                    />

                    <SiteDataRepeater
                      title="Section"
                      items={item.sections || []}
                      addLabel="Add Section"
                      emptyLabel="No sections added yet."
                      onAdd={() => addArrayItem(['legalLinks', index, 'sections'], { id: '', title: '', text: '' })}
                      onRemove={(sectionIndex) => removeArrayItem(['legalLinks', index, 'sections'], sectionIndex)}
                      renderItem={(section, sectionIndex) => (
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-sm font-medium text-stone-700">Section ID</label>
                            <input
                              type="text"
                              value={section.id || ''}
                              onChange={(e) => updateArrayItem(['legalLinks', index, 'sections'], sectionIndex, 'id', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-stone-700">Title</label>
                            <input
                              type="text"
                              value={section.title || ''}
                              onChange={(e) => updateArrayItem(['legalLinks', index, 'sections'], sectionIndex, 'title', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-stone-700">Text</label>
                            <textarea
                              value={section.text || ''}
                              onChange={(e) => updateArrayItem(['legalLinks', index, 'sections'], sectionIndex, 'text', e.target.value)}
                              className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )}
              />
            </SiteDataSection>

            <SiteDataSection className={activeTab === 'authData' ? '' : 'hidden'} title="Auth Copy" subtitle="Login and registration page content.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-stone-700">Login Text</label>
                  <input
                    type="text"
                    value={formData.authData.loginText}
                    onChange={(e) => updateNestedState(['authData', 'loginText'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Register Text</label>
                  <input
                    type="text"
                    value={formData.authData.registerText}
                    onChange={(e) => updateNestedState(['authData', 'registerText'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Heading Text</label>
                  <input
                    type="text"
                    value={formData.authData.headingText}
                    onChange={(e) => updateNestedState(['authData', 'headingText'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Subheading Text</label>
                  <textarea
                    value={formData.authData.subHeadingText}
                    onChange={(e) => updateNestedState(['authData', 'subHeadingText'], e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-stone-300 px-4 py-3 outline-none focus:border-black"
                    rows={3}
                  />
                </div>
              </div>
            </SiteDataSection>
          </main>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-stone-200 bg-stone-50 px-6 py-4">
          <div className="text-sm text-stone-500">
            {error ? 'Unable to load site data.' : 'Changes are stored through the site data API.'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDataModal;
