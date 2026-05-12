
// Generate a unique referral code
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 4);
}

// Get referral code from URL or localStorage
export function getReferralCode(): string | null {
  // Check URL first
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('referral', ref);
      return ref;
    }
    
    // Then check localStorage
    return localStorage.getItem('referral');
  }
  return null;
}

// Create shareable referral link
export function getReferralLink(baseUrl: string, code?: string): string {
  const referralCode = code || generateReferralCode();
  return `${baseUrl}?ref=${referralCode}`;
}

// Get social share URLs
export function getSocialShareUrls(link: string, savings?: number): {
  twitter: string;
  linkedin: string;
} {
  const text = savings 
    ? `I just saved $${savings}/month on AI tools! Check your savings at`
    : `Check your AI tool spending and find savings at`;
    
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
  };
}

// Apply referral discount (simulated)
export function applyReferralDiscount(originalPrice: number, hasReferral: boolean): number {
  if (!hasReferral) return originalPrice;
  return originalPrice * 0.9; // 10% discount
}
