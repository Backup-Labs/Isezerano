"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AdSpace } from '@/components/AdSpace';
import { Bookmark, Clock, Eye, Send, ArrowLeft, Calendar, Share2, Sparkles } from 'lucide-react';

interface Comment {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  body: string;
  created_at: string;
  replies: Comment[];
}

interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  body: string;
  cover_image: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
    color_accent: string;
  } | null;
  tags: { id: number; name: string; slug: string }[];
  author: {
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
    bio: string;
    twitter: string;
    website: string;
  };
  published_at: string;
  created_at: string;
  updated_at: string;
  is_premium: boolean;
  reading_time: number;
  view_count: number;
  seo_title: string;
  seo_description: string;
}

export default function ArticleDetail() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const router = useRouter();
  const { user, token, toggleBookmark, isBookmarked } = useApp();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchArticleAndComments = async () => {
    try {
      const [artRes, comRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/v1/articles/${slug}/`),
        fetch(`http://127.0.0.1:8000/api/v1/articles/${slug}/comments/`)
      ]);

      if (artRes.ok) {
        const artData = await artRes.json();
        setArticle(artData);
        
        // Log pageview analytics beacon
        fetch('http://127.0.0.1:8000/api/v1/analytics/track/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'pageview', article: artData.id })
        }).catch(err => console.error("Analytics error", err));
      } else {
        router.push('/404');
      }

      if (comRes.ok) {
        const comData = await comRes.json();
        setComments(Array.isArray(comData) ? comData : (comData.results || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleAndComments();
  }, [slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !token) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/articles/${slug}/comments/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ body: commentBody })
      });

      if (res.ok) {
        setCommentBody('');
        // Reload comments list
        const comRes = await fetch(`http://127.0.0.1:8000/api/v1/articles/${slug}/comments/`);
        if (comRes.ok) {
          const comData = await comRes.json();
          setComments(Array.isArray(comData) ? comData : (comData.results || []));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-sm tracking-wider text-theme-gray-400 font-semibold">DECODING STREAM...</span>
      </div>
    );
  }

  if (!article) return null;

  // Insert Inline Ad Slot after the third paragraph
  const renderBodyWithAds = (bodyContent: string) => {
    const paragraphs = bodyContent.split('\n\n');
    if (paragraphs.length <= 3) {
      return (
        <div className="flex flex-col gap-6 text-theme-gray-400 leading-relaxed text-base font-normal">
          {paragraphs.map((p, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 text-theme-gray-400 leading-relaxed text-base font-normal">
        {paragraphs.slice(0, 3).map((p, idx) => (
          <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }} />
        ))}
        
        {/* Inline Advertisement placement */}
        <div className="my-8 py-6 border-y border-white/5 bg-theme-charcoal/10 rounded-2xl">
          <AdSpace placement="in-article-inline" />
        </div>

        {paragraphs.slice(3).map((p, idx) => (
          <p key={idx + 3} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }} />
        ))}
      </div>
    );
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8 relative">
      {/* Dynamic NewsArticle Schema JSON-LD */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.subtitle || article.seo_description,
            "image": article.cover_image ? [article.cover_image] : [],
            "datePublished": article.published_at,
            "author": [{
              "@type": "Person",
              "name": article.author.first_name || article.author.username,
              "url": `http://127.0.0.1:3000/author/${article.author.username}`
            }]
          })
        }}
      />

      {/* Floating background gradient light source */}
      <div className="absolute top-[-50px] left-1/3 w-[300px] h-[300px] bg-theme-blue/10 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Back link */}
      <Link href="/" className="flex items-center gap-1 text-xs font-mono text-theme-gray-400 hover:text-white transition-colors mr-auto">
        <ArrowLeft className="w-4 h-4" />
        SYSTEM RETURN
      </Link>

      {/* Header Info */}
      <div className="flex flex-col gap-4">
        {article.category && (
          <span 
            className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg font-mono w-max"
            style={{ 
              backgroundColor: `${article.category.color_accent}20`,
              color: article.category.color_accent,
              border: `1px solid ${article.category.color_accent}40`
            }}
          >
            {article.category.name}
          </span>
        )}

        <h1 className="font-mono text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-theme-gray-400 text-base md:text-lg leading-relaxed font-light border-l-2 border-theme-blue pl-4">
          {article.subtitle}
        </p>

        {/* Byline / Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/5 text-xs font-mono text-theme-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme-blue" />
              <span className="text-white font-semibold">
                {article.author.first_name || article.author.username} {article.author.last_name}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.reading_time} MIN READ</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleBookmark(article.slug)}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked(article.slug) ? 'fill-theme-blue text-theme-blue' : ''}`} />
              <span>{isBookmarked(article.slug) ? 'SECURED' : 'SECURE'}</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Article link copied to interface buffer!");
              }}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>SHARE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Cover Image */}
      {article.cover_image && (
        <div className="w-full h-[300px] md:h-[450px] relative rounded-3xl overflow-hidden glass-panel">
          <img 
            src={article.cover_image.startsWith('http') ? article.cover_image : `http://127.0.0.1:8000${article.cover_image}`} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Body content */}
      <div className="max-w-3xl mx-auto w-full py-4">
        {renderBodyWithAds(article.body)}
      </div>

      {/* Tags Block */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-4 border-b border-white/5 max-w-3xl mx-auto w-full">
          {article.tags.map((tag) => (
            <span key={tag.id} className="glass-pill px-3 py-1 rounded-xl text-xs text-theme-gray-400 font-mono">
              #{tag.slug}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Card */}
      <div className="max-w-3xl mx-auto w-full glass-panel p-6 rounded-2xl flex gap-6 items-start mt-6">
        <div className="w-16 h-16 rounded-xl bg-theme-blue/10 border border-theme-blue/30 flex items-center justify-center shrink-0 font-mono text-xl text-white font-bold">
          {article.author.username[0].toUpperCase()}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-base font-bold text-white uppercase tracking-wide">
            Broadcast Terminal: {article.author.first_name || article.author.username}
          </h4>
          <p className="text-sm text-theme-gray-400 leading-relaxed">
            {article.author.bio || "Staff journalist covering core sectors of science, geopolitical shifts, and technology structures."}
          </p>
          {article.author.twitter && (
            <a href={article.author.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-theme-blue font-mono hover:underline mt-2">
              CONNECT FEED: {article.author.twitter.split('/').pop()}
            </a>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-3xl mx-auto w-full mt-12 flex flex-col gap-6">
        <h3 className="font-mono text-lg font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
          User Forums ({comments.length})
        </h3>

        {/* Comment post form */}
        {user ? (
          <form onSubmit={handlePostComment} className="flex flex-col gap-4 p-4 glass-panel rounded-2xl">
            <h4 className="text-xs text-theme-gray-400 font-mono uppercase tracking-wider">Inject Message to Forum</h4>
            <textarea 
              rows={4}
              placeholder="Inject thoughts onto the forum feed..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              className="w-full bg-theme-black/50 border border-white/5 px-4 py-3 rounded-xl text-sm text-white placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue/50"
              required
            />
            <button 
              type="submit" 
              disabled={submittingComment}
              className="px-5 py-2.5 bg-theme-blue hover:bg-theme-blue-glow hover:shadow-[0_0_12px_rgba(47,109,246,0.3)] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 self-end cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {submittingComment ? 'INJECTING...' : 'TRANSMIT MESSAGE'}
            </button>
          </form>
        ) : (
          <div className="glass-panel p-6 rounded-2xl text-center">
            <h4 className="text-sm font-semibold text-white mb-2">Auth credentials required for forum entry</h4>
            <p className="text-xs text-theme-gray-400 mb-4">Please log into the grid terminal to inject messages.</p>
            <Link href="/login" className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase rounded-lg">
              Grid Login
            </Link>
          </div>
        )}

        {/* Comments Feed List */}
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="p-5 glass-panel rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">{comment.user.first_name || comment.user.username}</span>
                <span className="text-theme-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-theme-gray-400 leading-relaxed font-light">{comment.body}</p>
              
              {/* Nested replies */}
              {comment.replies && comment.replies.map((reply) => (
                <div key={reply.id} className="ml-8 mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-theme-blue font-bold">↳ {reply.user.first_name || reply.user.username}</span>
                    <span className="text-theme-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-theme-gray-400 leading-relaxed">{reply.body}</p>
                </div>
              ))}
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-6 text-xs text-theme-gray-400 font-mono uppercase tracking-wider">
              Forum Feed Empty. Inject first update.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
