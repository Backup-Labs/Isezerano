"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AdSpace } from '@/components/AdSpace';
import { Bookmark, Clock, Eye, Send, ArrowLeft, Calendar, Share2 } from 'lucide-react';

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
      const artRes = await fetch(`${API_BASE_URL}/api/v1/articles/${slug}/`);
      if (artRes.status === 404) {
        router.push('/_not-found');
        return;
      }
      if (artRes.ok) {
        const artData = await artRes.json();
        setArticle(artData);
        
        // Log view event beacon
        fetch(API_BASE_URL + '/api/v1/analytics/track/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'pageview',
            article: artData.id
          })
        }).catch(err => console.error(err));
      }

      const commentsRes = await fetch(`${API_BASE_URL}/api/v1/articles/${slug}/comments/`);
      if (commentsRes.ok) {
        setComments(await commentsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchArticleAndComments();
    }
  }, [slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody || submittingComment) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/articles/${slug}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ body: commentBody })
      });

      if (res.ok) {
        setCommentBody('');
        const commentsRes = await fetch(`${API_BASE_URL}/api/v1/articles/${slug}/comments/`);
        if (commentsRes.ok) {
          setComments(await commentsRes.json());
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
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-t-2 border-r-2 border-theme-blue rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs tracking-widest text-theme-gray-400 uppercase font-bold">LOADING ARTICLE...</span>
      </div>
    );
  }

  if (!article) return null;

  const renderBodyWithAds = (bodyContent: string) => {
    const paragraphs = bodyContent.split('\n\n');
    if (paragraphs.length <= 3) {
      return (
        <div className="flex flex-col gap-6 text-theme-black leading-relaxed text-base font-normal">
          {paragraphs.map((p, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 text-theme-black leading-relaxed text-base font-normal">
        {paragraphs.slice(0, 3).map((p, idx) => (
          <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }} />
        ))}
        
        {/* Inline Advertisement placement */}
        <div className="my-8 py-6 border-y border-theme-gray-100 bg-theme-light-gray">
          <AdSpace placement="in-article-inline" />
        </div>

        {paragraphs.slice(3).map((p, idx) => (
          <p key={idx + 3} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }} />
        ))}
      </div>
    );
  };

  return (
    <article className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 bg-theme-white text-theme-black animate-fade-in">
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

      {/* Back link */}
      <Link href="/" className="flex items-center gap-1 text-xs font-mono text-theme-gray-400 hover:text-theme-blue transition-colors mr-auto uppercase font-bold tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        Return to Homepage
      </Link>

      {/* Header Info */}
      <div className="flex flex-col gap-4">
        {article.category && (
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-theme-blue w-max">
            {article.category.name}
          </span>
        )}

        <h1 className="serif-title text-3xl md:text-6xl font-extrabold uppercase tracking-tight text-theme-black leading-tight">
          {article.title}
        </h1>

        <p className="text-theme-gray-400 text-base md:text-lg leading-relaxed font-sans pl-4 border-l-2 border-theme-blue">
          {article.subtitle}
        </p>

        {/* Byline / Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-theme-gray-100 text-[10px] font-mono text-theme-black uppercase font-bold tracking-widest">
          <div className="flex items-center gap-4">
            <span>BY {article.author.first_name || article.author.username} {article.author.last_name}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-theme-blue" />
              {new Date(article.published_at || article.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-theme-blue" />
              {article.reading_time} MIN READ
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleBookmark(article.slug)}
              className="flex items-center gap-1 hover:text-theme-blue cursor-pointer"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(article.slug) ? 'fill-theme-blue text-theme-blue' : 'text-theme-black'}`} />
              <span>{isBookmarked(article.slug) ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Article link copied to clipboard.");
              }}
              className="flex items-center gap-1 hover:text-theme-blue cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Cover Image */}
      {article.cover_image && (
        <div className="w-full aspect-[21/9] overflow-hidden border border-theme-gray-100">
          <img 
            src={article.cover_image.startsWith('http') ? article.cover_image : `${API_BASE_URL}${article.cover_image}`} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Body content */}
      <div className="max-w-3xl mx-auto w-full py-4 font-sans text-theme-black">
        {renderBodyWithAds(article.body)}
      </div>

      {/* Tags Block */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-4 border-b border-theme-gray-100 max-w-3xl mx-auto w-full">
          {article.tags.map((tag) => (
            <span key={tag.id} className="px-2.5 py-1 border border-theme-gray-100 bg-theme-light-gray text-[10px] font-mono uppercase tracking-widest text-theme-black">
              #{tag.slug}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Card */}
      <div className="max-w-3xl mx-auto w-full border border-theme-gray-100 p-6 flex gap-6 items-start mt-6 bg-theme-light-gray">
        <div className="w-16 h-16 bg-theme-blue text-white flex items-center justify-center shrink-0 font-mono text-xl font-bold uppercase">
          {article.author.username[0]}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-xs font-bold text-theme-black uppercase tracking-widest">
            AUTHOR: {article.author.first_name || article.author.username}
          </h4>
          <p className="text-xs text-theme-gray-400 leading-relaxed">
            {article.author.bio || "Staff journalist covering core sectors of business, sustainable growth, and culture."}
          </p>
          {article.author.twitter && (
            <a href={article.author.twitter} target="_blank" rel="noopener noreferrer" className="text-[10px] text-theme-blue font-mono hover:underline mt-2 uppercase font-bold tracking-widest">
              Twitter Feed
            </a>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-3xl mx-auto w-full mt-12 flex flex-col gap-6">
        <h3 className="serif-title text-xl font-bold uppercase tracking-tight text-theme-black border-b border-theme-gray-100 pb-2">
          Comments ({comments.length})
        </h3>

        {/* Comment post form */}
        {user ? (
          <form onSubmit={handlePostComment} className="flex flex-col gap-4 p-5 border border-theme-gray-100 bg-theme-light-gray">
            <h4 className="text-xs text-theme-black font-mono uppercase tracking-widest font-bold">Post a Comment</h4>
            <textarea 
              rows={4}
              placeholder="Add your thoughts..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              className="w-full bg-white border border-theme-gray-100 px-4 py-3 text-xs font-mono text-theme-black placeholder-theme-gray-400 focus:outline-none focus:border-theme-blue"
              required
            />
            <button 
              type="submit" 
              disabled={submittingComment}
              className="px-5 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 self-end cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {submittingComment ? 'POSTING...' : 'POST COMMENT'}
            </button>
          </form>
        ) : (
          <div className="border border-theme-gray-100 p-6 text-center bg-theme-light-gray">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-theme-black mb-2">Authentication required to comment</h4>
            <p className="text-xs text-theme-gray-400 mb-4">Please sign in to your reader account to post comments.</p>
            <Link href="/login" className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-widest transition-all">
              Sign In
            </Link>
          </div>
        )}

        {/* Comments Feed List */}
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="p-5 border border-theme-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-theme-gray-400">
                <span className="text-theme-black font-bold">@{comment.user.username}</span>
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-theme-black leading-relaxed font-sans">{comment.body}</p>
              
              {/* Nested replies */}
              {comment.replies && comment.replies.map((reply) => (
                <div key={reply.id} className="ml-8 mt-3 pt-3 border-t border-theme-gray-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px] font-mono uppercase text-theme-gray-400">
                    <span className="text-theme-blue font-bold">↳ @{reply.user.username}</span>
                    <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-theme-black leading-relaxed font-sans">{reply.body}</p>
                </div>
              ))}
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-6 text-[10px] font-mono text-theme-gray-400 uppercase tracking-widest">
              No updates posted yet.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
