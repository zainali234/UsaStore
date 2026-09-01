export type Currency = 'USD' | 'GBP';

// Standard exchange rate: 1 USD = 0.79 GBP (1 GBP ≈ 1.27 USD)
export const USD_TO_GBP_RATE = 0.79;

export interface BankAccountDetails {
  region: 'UK' | 'US';
  currency: Currency;
  currencyLabel: string;
  badge: string;
  accountHolder: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  sortCode?: string; // UK specific
  routingNumber?: string; // US specific
  accountType?: string; // US specific
  minDeposit?: string;
}

export const BANK_DETAILS: Record<'UK' | 'US', BankAccountDetails> = {
  UK: {
    region: 'UK',
    currency: 'GBP',
    currencyLabel: 'British Pound (£)',
    badge: 'Receive & Hold British Pound from the United Kingdom',
    accountHolder: 'Zain Ali Ahmad',
    bankName: 'IFAST GLOBAL BANK LIMITED',
    bankAddress: 'iFAST Global Bank Limited, SQB, 77 Marsh Wall, London E14 9SH',
    accountNumber: '00416322',
    sortCode: '04-00-01',
  },
  US: {
    region: 'US',
    currency: 'USD',
    currencyLabel: 'US Dollar ($)',
    badge: 'Receive & Hold US Dollar from the United States',
    accountHolder: 'faran ahmed',
    bankName: 'JP Morgan Chase NA',
    bankAddress: '270 Park Avenue, New York, NY 10017',
    accountNumber: '30000002957351',
    routingNumber: '028000024',
    accountType: 'Checking (Current)',
    minDeposit: 'Min. deposit amount $2.',
  },
};

export function convertPrice(usdPrice: number, currency: Currency): number {
  if (currency === 'GBP') {
    return Number((usdPrice * USD_TO_GBP_RATE).toFixed(2));
  }
  return Number(usdPrice.toFixed(2));
}

export function formatPrice(usdPrice: number, currency: Currency): string {
  const converted = convertPrice(usdPrice, currency);
  if (currency === 'GBP') {
    return `£${converted.toFixed(2)}`;
  }
  return `$${converted.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'GBP' ? '£' : '$';
}
