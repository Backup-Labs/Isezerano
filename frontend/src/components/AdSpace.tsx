"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState, useRef } from 'react';

interface Ad {
  id: number;
  name: string;
  placement: string;
  image: string | null;
  html_content: string;
  target_url: string;
  cta_text?: string;
  sponsored_logo: string | null;
  sponsored_headline?: string;
  sponsored_video_url?: string;
}

interface AdSpaceProps {
  placement: 
    | 'header_banner' | 'hero_sidebar' | 'daily_verse_sidebar' | 'news_desk_sidebar'
    | 'full_width_1' | 'full_width_2' | 'full_width_3' | 'full_width_4'
    | 'sponsored_content' | 'grid_sidebar_stack_1' | 'grid_sidebar_stack_2' | 'grid_sidebar_stack_3'
    | 'sports_sidebar' | 'flyer_1' | 'flyer_2' | 'flyer_3'
    | 'header-banner' | 'sidebar-rail' | 'in-feed-native' | 'in-article-inline' | 'footer-banner' | 'interstitial';
  onDismiss?: () => void;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ placement, onDismiss }) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);
  const trackedImpression = useRef(false);

  // Parse YouTube/Vimeo URLs to embed URLs
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}`;
      }
    } catch (e) {
      console.error("Failed to parse video url", e);
    }
    return url;
  };

  const getDimensions = () => {
    switch (placement) {
      case 'header_banner':
      case 'header-banner':
        return 'w-full max-w-[970px] min-h-[90px]';
      case 'hero_sidebar':
        return 'w-full h-full';
      case 'news_desk_sidebar':
      case 'sports_sidebar':
      case 'sidebar-rail':
        return 'w-full min-h-[400px]';
      case 'daily_verse_sidebar':
      case 'grid_sidebar_stack_1':
      case 'grid_sidebar_stack_2':
      case 'grid_sidebar_stack_3':
      case 'in-article-inline':
        return 'w-full min-h-[250px]';
      case 'full_width_1':
      case 'full_width_2':
      case 'full_width_3':
      case 'full_width_4':
      case 'footer-banner':
        return 'w-full max-w-[728px] min-h-[90px]';
      case 'sponsored_content':
        return 'w-full min-h-[380px]';
      case 'flyer_1':
      case 'flyer_2':
      case 'flyer_3':
        return 'w-full max-w-[320px] aspect-square';
      default:
        return 'w-full min-h-[100px]';
    }
  };

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/ads/${placement}/`);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        } else {
          setAd(null);
        }
      } catch (err) {
        console.error("Ad fetch error", err);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [placement]);

  useEffect(() => {
    if (!ad || trackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && !trackedImpression.current) {
            trackedImpression.current = true;
            try {
              await fetch(API_BASE_URL + '/api/v1/analytics/track/', {
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

    return () => observer.disconnect();
  }, [ad]);

  const handleAdClick = async () => {
    if (!ad) return;
    try {
      await fetch(API_BASE_URL + '/api/v1/analytics/track/', {
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
      <div className={`mx-auto flex items-center justify-center bg-theme-charcoal border border-theme-blue-deep/30 animate-pulse rounded ${getDimensions()}`}>
        <span className="text-[10px] text-theme-gray-400 font-mono uppercase tracking-wider">Loading Ad Partner...</span>
      </div>
    );
  }

  // Fallback ad placeholder promoting Isezerano
  if (!ad) {
    const isSidebar = ['hero_sidebar','news_desk_sidebar','sports_sidebar','sidebar-rail'].includes(placement);
    return (
      <div className={`mx-auto flex flex-col items-center justify-start bg-theme-blue border border-theme-blue text-center p-6 relative overflow-hidden transition-all duration-300 group rounded ${getDimensions()}`}>
        <span className="text-[8px] text-white/70 bg-white/10 px-2 py-0.5 border border-white/20 font-mono absolute top-3 right-3 font-bold uppercase">Sponsor</span>
        <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 mt-8">
          <h4 className="serif-title text-base font-bold text-white mb-1 uppercase tracking-wider">ADVERTISE ON ISEZERANO</h4>
          <p className="text-[10px] text-white/70 max-w-[240px] font-sans leading-relaxed">
            Connect with thousands of daily business, design, and faith readers in Rwanda.
          </p>
          <a 
            href="mailto:ads@isezerano.com?subject=Advertise%20with%20Isezerano" 
            className="px-4 py-2 border border-white bg-white hover:bg-theme-light-gray text-theme-blue text-[9px] font-mono font-bold uppercase tracking-widest transition-all rounded shadow-sm w-max"
          >
            Request Ad Kit →
          </a>
        </div>
      </div>
    );
  }

  // Render custom sponsored content block template (Tax corner style)
  if (placement === 'sponsored_content') {
    const embedUrl = getEmbedUrl(ad.sponsored_video_url);
    return (
      <div ref={adRef} className="w-full bg-theme-charcoal border-2 border-theme-blue-deep rounded-md overflow-hidden p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-theme-blue-deep/30 pb-3">
          <div className="flex items-center gap-3">
            {ad.sponsored_logo && (
              <img 
                src={ad.sponsored_logo} 
                alt="Brand logo" 
                className="h-7 object-contain"
              />
            )}
            <span className="font-mono text-[10px] font-bold text-theme-blue uppercase tracking-widest">
              {ad.sponsored_headline || 'Sponsored Promo'}
            </span>
          </div>
          <span className="text-[8px] bg-theme-blue/10 border border-theme-blue/20 text-theme-blue px-2 py-0.5 font-mono font-bold uppercase rounded">
            PARTNER CONTENT
          </span>
        </div>

        {/* Video Player or Graphic */}
        {embedUrl ? (
          <div className="w-full aspect-video border border-theme-blue-deep rounded overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              title={ad.name}
            />
          </div>
        ) : ad.image ? (
          <a href={ad.target_url} target="_blank" rel="noopener noreferrer" onClick={handleAdClick} className="block w-full overflow-hidden border border-theme-blue-deep rounded">
            <img 
              src={ad.image} 
              alt={ad.name} 
              className="w-full aspect-video object-cover hover:scale-101 transition-transform duration-300"
            />
          </a>
        ) : null}

        <div className="flex flex-col gap-2">
          <h4 className="serif-title text-lg font-bold text-theme-light-gray leading-tight">
            {ad.name}
          </h4>
          <p className="text-xs text-theme-gray-400 font-sans leading-relaxed line-clamp-3">
            Discover resources and exclusive insights from our trusted corporate partners.
          </p>
          <a 
            href={ad.target_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleAdClick}
            className="mt-2 self-start px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-[10px] font-mono font-bold uppercase tracking-widest border border-theme-blue rounded transition-all shadow-sm"
          >
            {ad.cta_text || 'Learn More'}
          </a>
        </div>
      </div>
    );
  }

  // Render square flyer template
  if (placement.startsWith('flyer_')) {
    return (
      <div ref={adRef} className={`mx-auto border-2 border-theme-blue-deep rounded-md overflow-hidden relative group hover:border-theme-blue transition-all ${getDimensions()}`}>
        {ad.image ? (
          <a 
            href={ad.target_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleAdClick}
            className="block w-full h-full"
          >
            <img 
              src={ad.image} 
              alt={ad.name} 
              className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
            />
            {/* Absolute overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <span className="text-[8px] text-theme-blue font-mono font-bold uppercase tracking-widest">FLYER SPECIAL</span>
              <h4 className="serif-title text-sm font-bold uppercase leading-tight mt-1">{ad.name}</h4>
              <span className="text-[9px] font-mono mt-1 underline">{ad.cta_text || 'View Flyer'}</span>
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[8px] text-theme-light-gray border border-white/10 rounded font-mono uppercase tracking-wider font-bold">
              FLYER
            </div>
          </a>
        ) : (
          <div className="w-full h-full bg-theme-charcoal flex flex-col items-center justify-center p-6 text-center text-theme-gray-400">
            <span className="text-[9px] font-mono uppercase tracking-widest text-theme-blue font-bold mb-2">Local Flyer</span>
            <h5 className="serif-title text-sm text-theme-light-gray uppercase font-bold">{ad.name}</h5>
            <a href={ad.target_url} className="text-xs text-theme-blue underline mt-4 font-mono font-bold">{ad.cta_text || 'Learn More'}</a>
          </div>
        )}
      </div>
    );
  }

  // Standard/Legacy template rendering
  return (
    <div ref={adRef} className={`mx-auto relative overflow-hidden bg-theme-charcoal border border-theme-blue-deep hover:border-theme-blue transition-all duration-300 rounded group ${getDimensions()}`}>
      {placement === 'interstitial' && onDismiss && (
        <button 
          onClick={onDismiss} 
          className="absolute top-3 right-3 z-10 w-7 h-7 bg-theme-black border border-theme-blue text-theme-light-gray flex items-center justify-center hover:bg-theme-blue hover:text-white transition-colors cursor-pointer font-bold text-xs"
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
            placement === 'header_banner' || placement === 'header-banner' || placement === 'footer-banner' || placement.startsWith('full_width_')
              ? 'flex-row items-center p-3 gap-4 justify-between'
              : 'flex-col justify-between p-4 gap-4'
          }`}>
            
            {/* Image Thumbnail */}
            <div className={`overflow-hidden shrink-0 border border-theme-blue-deep rounded ${
              placement === 'header_banner' || placement === 'header-banner' || placement === 'footer-banner' || placement.startsWith('full_width_')
                ? 'w-20 md:w-32 h-12 md:h-16'
                : 'w-full h-36 mb-1'
            }`}>
              <img 
                src={ad.image} 
                alt={ad.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
            </div>

            {/* Ad Content Deck */}
            <div className="flex-grow flex flex-col justify-between gap-2 text-left min-w-0 pb-2">
              <div>
                <span className="text-[8px] font-mono tracking-widest text-theme-blue font-bold uppercase block">Sponsored Partnership</span>
                <h4 className="serif-title text-sm md:text-base font-bold text-theme-light-gray uppercase leading-tight">
                  {ad.name}
                </h4>
              </div>

              {/* Action Trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-theme-blue-deep/30 mt-2">
                <span className="px-3 py-1.5 bg-theme-blue text-white hover:bg-theme-blue-glow text-[9px] font-mono font-bold uppercase tracking-widest rounded transition-all shadow-sm">
                  {ad.cta_text || 'Learn More'}
                </span>
                <span className="text-[8px] text-theme-gray-400 font-mono uppercase font-bold tracking-widest">
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
          className="w-full h-full cursor-pointer text-xs"
        />
      ) : (
        <a 
          href={ad.target_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleAdClick}
          className="block w-full h-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white gap-1">
            <span className="text-[8px] font-mono tracking-widest text-theme-blue font-bold uppercase">Sponsored Partnership</span>
            <h4 className="serif-title text-sm font-bold uppercase text-white leading-tight">{ad.name}</h4>
            <span className="px-3 py-1 bg-theme-blue text-white text-[9px] font-mono font-bold uppercase tracking-wider self-start rounded mt-1 shadow-sm">
              {ad.cta_text || 'Learn More'}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 text-[8px] text-theme-light-gray border border-theme-blue-deep/20 uppercase font-mono tracking-wider font-bold rounded">
            Ad
          </div>
        </a>
      )}
    </div>
  );
};
