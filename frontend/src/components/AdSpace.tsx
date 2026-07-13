"use client";

import React, { useEffect, useState, useRef } from 'react';

interface Ad {
  id: number;
  name: string;
  placement: string;
  image: string | null;
  html_content: string;
  target_url: string;
  cta_text?: string;
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

  // Define reserved dimensions to maintain CLS stability and design structure
  const getDimensions = () => {
    switch (placement) {
      case 'header-banner':
        return 'w-full max-w-[970px] min-h-[90px] md:min-h-[180px]';
      case 'sidebar-rail':
        return 'w-full max-w-[300px] min-h-[480px]';
      case 'in-feed-native':
        return 'w-full min-h-[220px]';
      case 'in-article-inline':
        return 'w-full max-w-[336px] min-h-[200px]';
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
      <div className={`mx-auto flex items-center justify-center bg-white border border-[#000000] animate-pulse ${getDimensions()}`}>
        <span className="text-xs text-[#000000] font-mono font-bold uppercase tracking-wider">Loading Partner Ad...</span>
      </div>
    );
  }

  // Fallback placeholder if no ad campaigns are active
  if (!ad) {
    return (
      <div className={`mx-auto flex flex-col items-center justify-center bg-white border border-[#000000] text-center p-6 relative overflow-hidden transition-all duration-300 hover:shadow-[4px_4px_0px_#000000] ${getDimensions()}`}>
        <span className="text-[9px] text-[#000000] bg-neutral-100 px-2 py-0.5 border border-[#000000] font-mono absolute top-3 right-3 font-bold uppercase">Sponsor</span>
        <h4 className="serif-title text-lg font-bold text-[#000000] mb-1 uppercase tracking-wider">Advertise with PressPoint</h4>
        <p className="text-xs text-neutral-700 max-w-[280px] mb-4 font-sans leading-relaxed">Connect your brand with thousands of daily business, design, and culture readers.</p>
        <a href="mailto:ads@presspoint.com" className="px-4 py-2 border border-[#000000] bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-widest transition-all">
          Request Ad Kit →
        </a>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`mx-auto relative overflow-hidden bg-white border-2 border-[#000000] transition-all duration-300 hover:shadow-[6px_6px_0px_#000000] group ${getDimensions()}`}>
      {placement === 'interstitial' && onDismiss && (
        <button 
          onClick={onDismiss} 
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white border-2 border-[#000000] text-[#000000] flex items-center justify-center hover:bg-theme-blue hover:text-black transition-colors cursor-pointer font-bold text-sm hover:shadow-[2px_2px_0px_#000000]"
        >
          ✕
        </button>
      )}

      {ad.image ? (
        <a 
          href={ad.target_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleAdClick}
          className="block w-full h-full"
        >
          <div className={`flex h-full w-full ${
            placement === 'header-banner' || placement === 'footer-banner'
              ? 'flex-row items-center p-4 gap-6'
              : placement === 'sidebar-rail'
              ? 'flex-col justify-between p-5'
              : 'flex-col md:flex-row p-6 gap-6 justify-between'
          }`}>
            
            {/* Image Thumbnail */}
            <div className={`overflow-hidden shrink-0 border-2 border-[#000000] ${
              placement === 'header-banner' || placement === 'footer-banner'
                ? 'w-24 md:w-48 h-16 md:h-24'
                : placement === 'sidebar-rail'
                ? 'w-full h-52 mb-4'
                : 'w-full md:w-60 h-40 mb-4 md:mb-0'
            }`}>
              <img 
                src={ad.image} 
                alt={ad.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Ad Content Deck */}
            <div className="flex-grow flex flex-col justify-between gap-3 text-left min-w-0">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#1B3B6F] font-bold uppercase block mb-1">Sponsored Partnership</span>
                <h4 className="serif-title text-lg md:text-xl font-bold text-[#000000] uppercase leading-tight truncate">
                  {ad.name}
                </h4>
                <p className="text-xs text-neutral-700 font-sans line-clamp-2 mt-1 leading-relaxed">
                  Discover premium products and curated solutions from our trusted partners.
                </p>
              </div>

              {/* Action Trigger */}
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#000000]/10">
                <span className="px-4 py-2 bg-theme-blue text-white hover:bg-theme-blue-glow text-[10px] font-mono font-bold uppercase tracking-widest border border-[#000000] transition-all hover:shadow-[2px_2px_0px_#000000]">
                  {ad.cta_text || 'Learn More'}
                </span>
                <span className="text-[9px] text-[#1B3B6F] font-mono uppercase font-bold tracking-widest">
                  Sponsored
                </span>
              </div>
            </div>

          </div>
        </a>
      ) : ad.html_content ? (
        <div 
          onClick={handleAdClick}
          dangerouslySetInnerHTML={{ __html: ad.html_content }}
          className="w-full h-full cursor-pointer"
        />
      ) : (
        <a 
          href={ad.target_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleAdClick}
          className="block w-full h-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 text-white gap-2">
            <span className="text-[9px] font-mono tracking-widest text-theme-blue font-bold uppercase">Sponsored Partnership</span>
            <h4 className="serif-title text-xl font-bold uppercase text-white leading-tight">{ad.name}</h4>
            <span className="px-4 py-2 bg-theme-blue text-white text-xs font-mono font-bold uppercase tracking-wider self-start border border-[#000000] mt-1">
              {ad.cta_text || 'Learn More'}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black text-[9px] text-[#F5F6F8] border border-[#F5F6F8]/20 uppercase font-mono tracking-wider font-bold">
            Ad
          </div>
        </a>
      )}
    </div>
  );
};
