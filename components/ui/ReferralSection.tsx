'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Gift, 
  Copy, 
   
  Link, 
  Sparkles,
  Share2,
  Link as LinkIcon
} from 'lucide-react';
import { generateReferralCode, getSocialShareUrls } from '@/lib/referral';

interface ReferralSectionProps {
  savings?: number;
  emailSent?: boolean;
}

export default function ReferralSection({ savings = 0, emailSent = true }: ReferralSectionProps) {
  const [referralLink, setReferralLink] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    const code = generateReferralCode();
    setReferralLink(`${window.location.origin}?ref=${code}`);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied! Share with your team.', {
      icon: '🔗',
      duration: 3000,
    });
  };

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const urls = getSocialShareUrls(referralLink, savings);
    window.open(urls[platform], '_blank');
  };

  if (!emailSent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Gift className="w-6 h-6 text-amber-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#0F0E0D] mb-1 flex items-center gap-2">
            Share & Save
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-sm text-[#6B6A66] mb-3">
            Share this tool with your team or friends. When they complete an audit, 
            both of you get 10% off Credex credits!
          </p>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8A86]" />
              <input
                type="text"
                value={referralLink}
                readOnly
                className="w-full pl-9 pr-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg text-sm font-medium hover:bg-[#152e58] transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
          
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => handleShare('twitter')}
              className="text-xs text-[#1DA1F2] hover:underline flex items-center gap-1"
            >
              <Link className="w-4 h-4" />
              Share on X
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="text-xs text-[#0A66C2] hover:underline flex items-center gap-1"
            >
              <Link className="w-4 h-4" />
              Share on LinkedIn
            </button>
          </div>
          
          <p className="text-xs text-[#8C8A86] mt-3 flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            Both parties get 10% off when they complete an audit
          </p>
        </div>
      </div>
    </motion.div>
  );
}