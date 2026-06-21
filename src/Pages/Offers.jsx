import React, { useState, useEffect } from 'react';
import adminApi from '../config/api';
import toast from 'react-hot-toast';

// 1. Define schema fields per template so the UI knows what inputs to generate dynamically
const defaultTemplates = [
  {
    id: 'promo_basic',
    name: 'Basic Promo',
    subject: 'Special Offer — Just for You! 🎁',
    fields: {
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600&auto=format&fit=crop',
      badgeText: 'Exclusive Offer',
      title: 'A Special Gift For You',
      description: 'We want to celebrate you! Use the exclusive promo code below at checkout to claim your savings.',
      promoCode: 'SAVE10',
      discountText: '🎉 10% OFF YOUR NEXT ORDER',
      buttonText: 'Shop & Save Now',
      buttonUrl: '#',
      footerText: 'This is a limited-time offer. Cannot be combined with other discounts.'
    },
    // Generate clean HTML structure by interpolating live states
    compile: (f) => `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
        <img src="${f.image}" alt="Promo Header" style="width: 100%; height: auto; display: block;" />
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 14px; font-weight: bold; color: #e63946; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">${f.badgeText}</div>
          <h1 style="font-size: 28px; color: #1d3557; margin: 0 0 15px 0; font-weight: 700;">${f.title}</h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">${f.description}</p>
          <div style="background-color: #f8f9fa; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: inline-block; min-width: 250px;">
            <span style="font-size: 12px; color: #64748b; display: block; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Your Coupon Code</span>
            <strong style="font-size: 26px; color: #e63946; font-family: monospace; letter-spacing: 2px;">${f.promoCode}</strong>
            <span style="font-size: 14px; color: #2a9d8f; display: block; margin-top: 5px; font-weight: bold;">${f.discountText}</span>
          </div>
          <div>
            <a href="${f.buttonUrl}" style="background-color: #1d3557; color: #ffffff; padding: 14px 32px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">${f.buttonText}</a>
          </div>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">${f.footerText}</p>
        </div>
      </div>
    `
  },
  {
    id: 'new_arrivals',
    name: 'New Arrivals',
    subject: '🔥 New Arrivals — Fresh styles just added!',
    fields: {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      badgeText: 'Just Dropped',
      title: 'The Next Generation Layout',
      description: 'Our highly anticipated latest collection is finally here. Discover fresh styles designed to elevate your everyday look. Stock is strictly limited!',
      feature1: '✨ Premium Quality: Crafted from top-tier materials.',
      feature2: '⚡ Limited Edition: Once it\'s gone, it\'s gone.',
      feature3: '📦 Free Shipping: On all orders over $50.',
      buttonText: 'Explore Collection',
      buttonUrl: '#',
      footerText: 'Be the first to wear the trend.'
    },
    compile: (f) => `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
        <img src="${f.image}" alt="New Collection" style="width: 100%; height: auto; display: block;" />
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 14px; font-weight: bold; color: #4361ee; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">${f.badgeText}</div>
          <h1 style="font-size: 28px; color: #0f172a; margin: 0 0 15px 0; font-weight: 700;">${f.title}</h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">${f.description}</p>
          <div style="margin-bottom: 35px; text-align: left; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 12px; font-size: 15px; color: #334155;">${f.feature1}</div>
            <div style="margin-bottom: 12px; font-size: 15px; color: #334155;">${f.feature2}</div>
            <div style="font-size: 15px; color: #334155;">${f.feature3}</div>
          </div>
          <div>
            <a href="${f.buttonUrl}" style="background-color: #4361ee; color: #ffffff; padding: 14px 35px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">${f.buttonText}</a>
          </div>
        </div>
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #94a3b8;">
          <p style="font-size: 12px; margin: 0;">${f.footerText}</p>
        </div>
      </div>
    `
  },
  {
    id: 'season_sale',
    name: 'Season Sale',
    subject: '🚨 Season Sale: Up to 50% Off Everything!',
    fields: {
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop',
      badgeText: 'BIGGEST SALE OF THE YEAR',
      title: 'UP TO 50% OFF',
      description: 'Don\'t miss out on our spectacular end-of-season clearance event. Prices are slashed across the entire store, but lines are moving fast!',
      urgencyText: '⏳ HURRY! Sale ends strictly this weekend.',
      buttonText: 'Shop the Sale Now',
      buttonUrl: '#',
      footerText: 'No code required. Prices as marked on site. While supplies last.'
    },
    compile: (f) => `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
        <img src="${f.image}" alt="Season Sale" style="width: 100%; height: auto; display: block;" />
        <div style="padding: 40px 30px; text-align: center;">
          <div style="background-color: #ffb703; color: #023047; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">${f.badgeText}</div>
          <h1 style="font-size: 32px; color: #023047; margin: 0 0 10px 0; font-weight: 800;">${f.title}</h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">${f.description}</p>
          <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 15px 0; margin-bottom: 30px;">
            <span style="font-size: 14px; color: #e63946; font-weight: bold;">${f.urgencyText}</span>
          </div>
          <div>
            <a href="${f.buttonUrl}" style="background-color: #fb8500; color: #ffffff; padding: 15px 40px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 16px; box-shadow: 0 4px 10px rgba(251, 133, 0, 0.3);">${f.buttonText}</a>
          </div>
        </div>
        <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="font-size: 11px; color: #a0aec0; margin: 0; line-height: 1.4;">${f.footerText}</p>
        </div>
      </div>
    `
  }
];

const Offers = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplates[0]);
  const [subject, setSubject] = useState(defaultTemplates[0].subject);
  const [fields, setFields] = useState(defaultTemplates[0].fields);
  const [html, setHtml] = useState('');
  const [sending, setSending] = useState(false);

  // 2. Re-compile the raw HTML payload whenever any custom input field or layout edits take place
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.compile) {
      setHtml(selectedTemplate.compile(fields));
    }
  }, [fields, selectedTemplate]);

 
  const handleTemplateChange = (templateId) => {
    const template = defaultTemplates.find(x => x.id === templateId);
    if (!template) return;
    setSelectedTemplate(template);
    setSubject(template.subject);
    setFields(template.fields); // Load configuration schema for inputs
  };

  const handleFieldChange = (key, value) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSend = async () => {
    if (!subject || !html) return toast.error('Please provide subject and message configuration.');
    setSending(true);
    try {
      const listRes = await adminApi.get('/subscribers/admin');
      const count = Array.isArray(listRes.data?.subscribers) ? listRes.data.subscribers.length : 0;
      const loadingToast = toast.loading(`Sending to ${count} subscribers...`);

      const { data } = await adminApi.post('/subscribers/admin/send', { subject, html });
      if (data?.success) {
        toast.success(`Sent to ${data.sent} subscribers`, { id: loadingToast });
        navigate('/subscribers');
      } else {
        toast.error(data?.error || 'Send failed', { id: loadingToast });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Send failed');
    } finally { 
      setSending(false); 
    }
  };

  // Helper utility to make variable names look elegant in the layout form views
  const formatLabel = (str) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (match) => match.toUpperCase());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Premium Offers & Campaigns</h2>
      
      {/* Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side Workspace Controls */}
        <div className="space-y-5 bg-white p-6 border rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">⚙️ Campaign Setup</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Base Email Structure Template</label>
            <select 
              value={selectedTemplate.id} 
              onChange={(e) => handleTemplateChange(e.target.value)} 
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-black outline-none"
            >
              {defaultTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Email Subject Line</label>
            <input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Enter subject header..." 
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Dynamic Content Block Section generated on standard key schemas definitions */}
          <div className="pt-2">
            <h3 className="text-md font-semibold mb-3 text-gray-700 border-t pt-4">✏️ Custom Fields Template Editor</h3>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {Object.keys(fields).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    {formatLabel(key)}
                  </label>
                  {key === 'description' || key === 'footerText' ? (
                    <textarea
                      value={fields[key]}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      rows={3}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={fields[key]}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSend} 
              disabled={sending} 
              className={`w-full py-3 px-4 font-bold text-white rounded-lg transition-all ${
                sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {sending ? 'Dispatching Mailers...' : '🚀 Send Campaign to All Subscribers'}
            </button>
          </div>
        </div>

        {/* Right Side: Instant Responsive Interactive Preview Engine */}
        <div className="flex flex-col h-full bg-gray-50 p-6 border rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            👁️ Real-time Desktop & Mobile View Preview
          </h3>
          <div className="border rounded-xl bg-white p-4 overflow-auto flex-1 max-h-[680px] shadow-inner">
            {/* Renders the internal variable output raw markup updates instantly inside the DOM window safely */}
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          
          {/* Collapsible raw HTML string debug box underneath if raw markup updates need validation */}
          <details className="mt-4 bg-gray-100 p-2 rounded-lg cursor-pointer text-xs text-gray-600">
            <summary className="font-semibold select-none">View Outgoing Clean Raw Markup String Payload</summary>
            <textarea 
              readOnly 
              value={html} 
              className="w-full mt-2 p-2 h-24 font-mono bg-white border rounded text-[10px]"
            />
          </details>
        </div>

      </div>
    </div>
  );
};

export default Offers;