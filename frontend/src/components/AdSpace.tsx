"use client";

import React, { useEffect, useState, useRef } from 'react';

interface Ad {
  id: number;
  name: string;
  placement: string;
  image: string | null;
  html_content: string;
  target_url: string;
}

interface AdSpaceProps {
  placement: 'header-banner' | 'sidebar-rail' | 'in-feed-native' | 'in-article-inline' | 'footer-banner' | 'interstitial';
  onDismiss?: () => void;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ placement, onDismiss }) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);
  const trackedImpression = useRef(false);

  // Define reserved dimensions to maintain CLS stability
  const getDimensions = () => {
    switch (placement) {
      case 'header-banner':
        return 'w-full max-w-[970px] min-h-[90px] md:min-h-[250px]';
      case 'sidebar-rail':
        return 'w-full max-w-[300px] min-h-[600px]';
      case 'in-feed-native':
        return 'w-full min-h-[350px]';
      case 'in-article-inline':
        return 'w-full max-w-[336px] min-h-[280px]';
      case 'footer-banner':
        return 'w-full max-w-[728px] min-h-[90px]';
      case 'interstitial':
        return 'w-full max-w-[500px] min-h-[300px]';
      default:
        return 'w-full min-h-[100px]';
    }
  };

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/ads/${placement}/`);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        }
      } catch (err) {
        console.error("Ad fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  // Set up IntersectionObserver to log impressions
  useEffect(() => {
    if (!ad || trackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && !trackedImpression.current) {
            trackedImpression.current = true;
            try {
              await fetch('http://127.0.0.1:8000/api/v1/analytics/track/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  event_type: 'ad_impression',
                  ad_slot: ad.id
                })
              });
            } catch (err) {
              console.error("Failed to track ad impression", err);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ad]);

  const handleAdClick = async () => {
    if (!ad) return;
    try {
      await fetch('http://127.0.0.1:8000/api/v1/analytics/track/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: 'ad_click',
          ad_slot: ad.id
        })
      });
    } catch (err) {
      console.error("Failed to track ad click", err);
    }
  };

  if (loading) {
    return (
      <div className={`mx-auto flex items-center justify-center bg-theme-charcoal/30 border border-white/5 animate-pulse rounded-lg ${getDimensions()}`}>
        <span className="text-xs text-theme-gray-400 font-mono">Loading Advertisement...</span>
      </div>
    );
  }

  // Fallback placeholder if no ad campaigns are active
  if (!ad) {
    return (
      <div className={`mx-auto flex flex-col items-center justify-center bg-theme-charcoal/20 border border-white/5 text-center p-4 rounded-lg relative overflow-hidden ${getDimensions()}`}>
        <span className="text-[10px] text-theme-gray-400 uppercase tracking-widest font-mono absolute top-2 right-2">Sponsor Link</span>
        <h4 className="text-sm font-semibold text-white mb-1">Advertise on The Pulse</h4>
        <p className="text-xs text-theme-gray-400 max-w-[250px] mb-3">Reach thousands of tech and futurism readers daily.</p>
        <a href="/advertise" className="text-xs text-theme-blue font-semibold hover:underline">View Campaigns →</a>
      </div>
    );
  }

  return (
    <div ref={adRef} className="mx-auto relative rounded-lg overflow-hidden group">
      {placement === 'interstitial' && onDismiss && (
        <button 
          onClick={onDismiss} 
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-theme-blue transition-colors cursor-pointer"
        >
          ✕
        </button>
      )}

      {ad.html_content ? (
        <div 
          onClick={handleAdClick}
          dangerouslySetInnerHTML={{ __html: ad.html_content }}
          className="w-full h-full"
        />
      ) : (
        <a 
          href={ad.target_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleAdClick}
          className="block w-full h-full relative"
        >
          {ad.image && (
            <img 
              src={ad.image.startsWith('http') ? ad.image : `http://127.0.0.1:8000${ad.image}`} 
              alt={ad.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/70 text-[9px] text-theme-gray-400 rounded uppercase font-mono tracking-wider">
            Sponsored
          </div>
        </a>
      )}
    </div>
  );
};
