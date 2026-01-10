"use client";

import { Share2, MessageCircle, Facebook, Twitter, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonsProps {
  title: string;
  message?: string;
  text?: string; // alias for message
  url?: string;
  bloodType?: string;
  urgency?: 'normal' | 'urgent' | 'critical';
  compact?: boolean;
}

export default function ShareButtons({ title, message, text, url, bloodType, urgency = 'normal', compact = false }: ShareButtonsProps) {
  const messageContent = message || text || '';
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const urgencyEmoji = {
    normal: '🩸',
    urgent: '⚠️',
    critical: '🚨',
  };

  const fullMessage = `${urgencyEmoji[urgency]} ${title}\n\n${messageContent}\n\n${bloodType ? `Blood Type Needed: ${bloodType}\n\n` : ''}Help save a life! 🙏\n\n${shareUrl}`;

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(messageContent)}`;
    window.open(fbUrl, '_blank');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messageContent)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: messageContent,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShare(!showShare);
    }
  };

  // Compact inline buttons mode
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={shareToWhatsApp}
          className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={shareToFacebook}
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </button>
        <button
          onClick={shareToTwitter}
          className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-500 transition-colors"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share Request
      </motion.button>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[200px]"
          >
            <div className="text-sm font-medium text-gray-700 mb-3">Share via</div>
            
            <div className="space-y-2">
              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span className="font-medium">Facebook</span>
              </button>
              
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-500 transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span className="font-medium">Twitter</span>
              </button>
              
              <hr className="my-2" />
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="font-medium">Copy Message</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showShare && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

// Quick WhatsApp share button
export function WhatsAppShareButton({ message, bloodType, className = '' }: { message: string; bloodType?: string; className?: string }) {
  const fullMessage = `🚨 URGENT BLOOD NEEDED 🚨\n\n${message}\n\n${bloodType ? `Blood Type: ${bloodType}\n\n` : ''}Please share and help save a life! 🙏`;

  const share = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={share}
      className={`flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      Share on WhatsApp
    </motion.button>
  );
}
