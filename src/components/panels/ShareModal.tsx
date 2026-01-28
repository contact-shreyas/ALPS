'use client';

import { useState } from 'react';
import { Share2, X, Copy, Check, Mail, Twitter, Facebook, Linkedin } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
  currentUrl: string;
  title?: string;
  description?: string;
}

export function ShareModal({
  onClose,
  currentUrl,
  title = 'Light Pollution Map',
  description = 'Check out this light pollution data visualization'
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async (platform: string) => {
    try {
      const shareData = {
        title,
        text: description,
        url: currentUrl
      };

      switch (platform) {
        case 'native': {
          if (navigator.share) {
            await navigator.share(shareData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }
          break;
        }
        case 'twitter': {
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(currentUrl)}`;
          window.open(twitterUrl, '_blank');
          break;
        }
        case 'facebook': {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
          window.open(facebookUrl, '_blank');
          break;
        }
        case 'linkedin': {
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
          window.open(linkedinUrl, '_blank');
          break;
        }
        case 'email': {
          const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${currentUrl}`)}`;
          window.location.href = emailUrl;
          break;
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 p-2 border rounded text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {navigator.share && (
            <button
              onClick={() => handleShare('native')}
              className="flex items-center justify-center p-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5 mr-2" />
              <span className="text-sm">Share</span>
            </button>
          )}
          <button
            onClick={() => handleShare('email')}
            className="flex items-center justify-center p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 mr-2" />
            <span className="text-sm">Email</span>
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Twitter className="w-5 h-5 mr-2" />
            <span className="text-sm">Twitter</span>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Facebook className="w-5 h-5 mr-2" />
            <span className="text-sm">Facebook</span>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="flex items-center justify-center p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Linkedin className="w-5 h-5 mr-2" />
            <span className="text-sm">LinkedIn</span>
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm">
            Shared successfully!
          </div>
        )}
      </div>
    </div>
  );
}