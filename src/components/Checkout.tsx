import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Upload, X, Image as ImageIcon, Building2, ShieldCheck, CheckCircle2, AlertCircle, FileText, Globe } from 'lucide-react';
import { CartItem, CheckoutDetails, Currency } from '../types';
import { BANK_DETAILS, formatPrice, convertPrice, getCurrencySymbol } from '../currency';

interface CheckoutProps {
  cartItems: CartItem[];
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
  onBackToCart: () => void;
  onOrderSuccess: (details: CheckoutDetails) => void;
}

export default function Checkout({ 
  cartItems, 
  currency = 'USD',
  onCurrencyChange,
  onBackToCart, 
  onOrderSuccess 
}: CheckoutProps) {
  const [formData, setFormData] = useState<CheckoutDetails>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: currency === 'GBP' ? 'United Kingdom' : 'United States',
    currency: currency,
    paymentMethod: 'bank_transfer',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBankRegion, setSelectedBankRegion] = useState<'UK' | 'US'>(currency === 'GBP' ? 'UK' : 'US');
  
  // Bank modal state
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Sync bank region when currency or country changes
  useEffect(() => {
    if (formData.country === 'United Kingdom') {
      setSelectedBankRegion('UK');
      if (currency !== 'GBP' && onCurrencyChange) {
        onCurrencyChange('GBP');
      }
    } else if (formData.country === 'United States') {
      setSelectedBankRegion('US');
      if (currency !== 'USD' && onCurrencyChange) {
        onCurrencyChange('USD');
      }
    }
  }, [formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'country') {
      if (value === 'United Kingdom') {
        setSelectedBankRegion('UK');
        if (onCurrencyChange) onCurrencyChange('GBP');
      } else if (value === 'United States') {
        setSelectedBankRegion('US');
        if (onCurrencyChange) onCurrencyChange('USD');
      }
    }
  };

  const handleOpenBankModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // Form Validations for shipping address
    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      setErrorMessage('Please complete all standard shipping address fields to proceed.');
      return;
    }

    if (formData.country === 'United Kingdom') {
      setSelectedBankRegion('UK');
    } else {
      setSelectedBankRegion(currency === 'GBP' ? 'UK' : 'US');
    }

    setShowBankModal(true);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setModalError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      setModalError('');
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentDisplayCurrency: Currency = selectedBankRegion === 'UK' ? 'GBP' : 'USD';
  const totalAmountInRegion = formatPrice(total, currentDisplayCurrency);

  const handleCompleteOrder = () => {
    setModalError('');
    if (!screenshot) {
      setModalError('Please upload your payment transfer screenshot (SS) to verify order payment.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowBankModal(false);
      onOrderSuccess({
        ...formData,
        currency: currentDisplayCurrency,
        totalPaidFormatted: totalAmountInRegion,
        bankRegion: selectedBankRegion,
        paymentScreenshot: screenshot,
      });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <button
        onClick={onBackToCart}
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors gap-2 cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shopping basket
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Shipping Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-xs space-y-5">
            <h3 className="text-lg font-bold font-sans text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 rounded-full text-slate-950 text-xs font-black flex items-center justify-center">1</span>
                Prime Delivery Shipping Address
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                {formData.country === 'United Kingdom' ? '🇬🇧 UK Delivery (GBP £)' : '🇺🇸 US Delivery (USD $)'}
              </span>
            </h3>

            {errorMessage && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="johndoe@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder={formData.country === 'United Kingdom' ? '+44 20 7946 0912' : '+1 (555) 019-2834'}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Country / Region
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300/80 bg-amber-50/20 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="United Kingdom">🇬🇧 United Kingdom (Pound GBP - UK Bank)</option>
                  <option value="United States">🇺🇸 United States (Dollar USD - US Bank)</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="France">🇫🇷 France</option>
                </select>
                <span className="text-[11px] text-amber-700 block mt-1">
                  {formData.country === 'United Kingdom' 
                    ? '✓ UK Bank Details & GBP (£) automatically selected' 
                    : '✓ US Bank Details & USD ($) automatically selected'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Street Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  placeholder={formData.country === 'United Kingdom' ? '10 Downing Street' : '123 Main Street'}
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Street Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Flat 4 / Suite"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder={formData.country === 'United Kingdom' ? 'London' : 'New York'}
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  {formData.country === 'United Kingdom' ? 'County' : 'State / Region'}
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder={formData.country === 'United Kingdom' ? 'Greater London' : 'NY'}
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  {formData.country === 'United Kingdom' ? 'Postcode' : 'ZIP / Postal Code'}
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  placeholder={formData.country === 'United Kingdom' ? 'SW1A 2AA' : '10001'}
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Bank Payment Method Info Card */}
          <div className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-2xl flex items-center gap-3">
            <Building2 className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block">
                {formData.country === 'United Kingdom' ? '🇬🇧 Direct UK Bank Transfer (GBP £)' : '🇺🇸 Direct US Bank Transfer (USD $)'}
              </span>
              {formData.country === 'United Kingdom' ? (
                <>Clicking <span className="font-bold text-amber-700">Pay & Complete Secure Order</span> will display our UK Bank Details (<span className="font-bold text-slate-900">iFAST Global Bank - Zain Ali Ahmad</span>, Sort Code: <span className="font-bold">04-00-01</span>) and upload input for transfer receipt.</>
              ) : (
                <>Clicking <span className="font-bold text-amber-700">Pay & Complete Secure Order</span> will display our US Bank Details (<span className="font-bold text-slate-900">JP Morgan Chase - faran ahmed</span>, Routing: <span className="font-bold">028000024</span>) and upload input for transfer receipt.</>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Button */}
        <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-5 lg:sticky lg:top-28 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 font-bold text-base font-sans uppercase tracking-wide">
              Purchase Summary
            </h3>
            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
              {currency === 'GBP' ? 'GBP (£)' : 'USD ($)'}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
            {cartItems.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center shrink-0">
                    <img src={item.product.image} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt={item.product.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} {item.selectedColor ? `| ${item.selectedColor}` : ''}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0">
                  {formatPrice(item.product.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full h-px border-t border-slate-200"></div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Checkout Subtotal</span>
              <span className="font-mono text-slate-700">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated {currency === 'GBP' ? 'VAT (8%)' : 'Sales Tax (8%)'}</span>
              <span className="font-mono text-slate-700">{formatPrice(tax, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Prime Delivery Fee</span>
              <span className="text-emerald-600 font-bold text-[10px] uppercase">FREE SHIPPING</span>
            </div>
            <div className="w-full h-px border-t border-slate-200 my-2"></div>
            <div className="flex justify-between font-bold text-sm text-slate-800">
              <span>Grand Total</span>
              <span className="font-mono text-slate-950 text-base">{formatPrice(total, currency)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenBankModal}
              className="w-full inline-flex items-center justify-center p-3.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-md gap-2 cursor-pointer group"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400 group-hover:text-slate-950" />
              <span>PAY & COMPLETE SECURE ORDER • {formatPrice(total, currency)}</span>
            </button>
            
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100/60 flex gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-[10px] text-emerald-700 leading-tight">
                <span className="font-bold block">MzAmazon Trusted Escrow</span>
                Bank transfer verified under standard buyer protection and instant cashbacks.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANK DETAILS & SCREENSHOT UPLOAD MODAL */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full inline-block mb-1">
                  Direct Bank Transfer
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Bank Payment Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transfer exactly <span className="font-bold text-slate-900 font-mono text-sm">{totalAmountInRegion}</span> ({currentDisplayCurrency}) to the account below
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Region Tabs Switcher: UK vs US */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedBankRegion('UK');
                  if (onCurrencyChange) onCurrencyChange('GBP');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedBankRegion === 'UK'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🇬🇧</span>
                <span>Within the UK (GBP £)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBankRegion('US');
                  if (onCurrencyChange) onCurrencyChange('USD');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedBankRegion === 'US'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🇺🇸</span>
                <span>United States (USD $)</span>
              </button>
            </div>

            {/* Region header notification */}
            <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                {selectedBankRegion === 'UK' ? '🇬🇧 Receive & Hold British Pound' : '🇺🇸 Receive & Hold US Dollar'}
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {totalAmountInRegion}
              </span>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded-r-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* DYNAMIC BANK DETAILS RENDERING */}
            {selectedBankRegion === 'UK' ? (
              /* UK Bank Details (From Provided Screenshot) */
              <div className="space-y-3.5 text-slate-800 text-sm">
                {/* Account Holder Name */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Name of the Account</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {BANK_DETAILS.UK.accountHolder}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.UK.accountHolder, 'uk_accountHolder')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy Name"
                  >
                    {copiedField === 'uk_accountHolder' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Sort Code */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Sort Code</span>
                    <span className="font-mono font-bold text-slate-900 text-base tracking-wider">
                      {BANK_DETAILS.UK.sortCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.UK.sortCode, 'uk_sortCode')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy Sort Code"
                  >
                    {copiedField === 'uk_sortCode' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Account Number</span>
                    <span className="font-mono font-bold text-slate-900 text-base tracking-wider">
                      {BANK_DETAILS.UK.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.UK.accountNumber, 'uk_accountNumber')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedField === 'uk_accountNumber' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bank Name */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Bank Name</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {BANK_DETAILS.UK.bankName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.UK.bankName, 'uk_bankName')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy Bank Name"
                  >
                    {copiedField === 'uk_bankName' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bank Address */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Bank Address</span>
                    <span className="font-semibold text-slate-900 text-xs leading-relaxed block max-w-xs">
                      {BANK_DETAILS.UK.bankAddress}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.UK.bankAddress, 'uk_bankAddress')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy Bank Address"
                  >
                    {copiedField === 'uk_bankAddress' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* US Bank Details */
              <div className="space-y-3.5 text-slate-800 text-sm">
                {/* Account Holder Name */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Account holder name</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {BANK_DETAILS.US.accountHolder}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.US.accountHolder, 'us_accountHolder')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy account holder name"
                  >
                    {copiedField === 'us_accountHolder' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Account number</span>
                    <span className="font-mono font-bold text-slate-900 text-base tracking-wide">
                      {BANK_DETAILS.US.accountNumber}
                    </span>
                    <span className="text-xs font-bold text-rose-600 block mt-0.5">Min. deposit amount $2.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.US.accountNumber, 'us_accountNumber')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy account number"
                  >
                    {copiedField === 'us_accountNumber' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Routing Number */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Routing number</span>
                    <span className="font-mono font-bold text-slate-900 text-base tracking-wide">
                      {BANK_DETAILS.US.routingNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.US.routingNumber || '', 'us_routingNumber')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy routing number"
                  >
                    {copiedField === 'us_routingNumber' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bank Name */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Bank (Based in US)</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {BANK_DETAILS.US.bankName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.US.bankName, 'us_bankName')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy bank name"
                  >
                    {copiedField === 'us_bankName' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bank Address */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Bank address</span>
                    <span className="font-semibold text-slate-900 text-xs leading-relaxed block max-w-xs">
                      {BANK_DETAILS.US.bankAddress}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.US.bankAddress, 'us_bankAddress')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy bank address"
                  >
                    {copiedField === 'us_bankAddress' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Account Type */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Account type</span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {BANK_DETAILS.US.accountType}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_DETAILS.US.accountType || '', 'us_accountType')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy account type"
                  >
                    {copiedField === 'us_accountType' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SCREENSHOT UPLOAD SECTION */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 sm:p-5 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Upload Payment Screenshot (SS)</span>
                <span className="text-rose-600 text-[10px] font-black">* Required</span>
              </label>

              {!screenshot ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white p-5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Click to upload transfer screenshot</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Supports PNG, JPG, JPEG, WEBP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={screenshot} alt="Screenshot proof" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{screenshotName || 'Payment_Screenshot.png'}</p>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Image attached
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotName('');
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Complete Order Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
                className={`w-full py-3.5 px-6 ${
                  isSubmitting ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 cursor-pointer'
                } text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying Screenshot & Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span>Submit Screenshot & Complete Order ({totalAmountInRegion})</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
