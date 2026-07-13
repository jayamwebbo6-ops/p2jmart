import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website', seo }) => {
  const siteName = "P2J Mart";
  const defaultTitle = "P2J Mart | Customized Gifts, Personalized Combo Packs & Custom Printing";
  const defaultDescription = "Discover P2J Mart - India's premium destination for personalized customized gifts, custom prints, mugs, photo frames, and handpicked combo gift packs for every occasion. Fast shipping & secure checkout.";
  const defaultKeywords = "customized gifts, personalized gifts online, custom printing, photo mugs online, customized photo frames, combo gift packs, anniversary gifts, corporate gifting, P2J Mart";
  
  // Resolve host/env logic for production vs demo
  const isProduction = 
    import.meta.env.VITE_ENABLE_SEO === 'true' || 
    window.location.hostname === 'p2jmart.com' || 
    window.location.hostname === 'www.p2jmart.com' ||
    window.location.hostname === 'p2jmart.in' ||
    window.location.hostname === 'www.p2jmart.in';

  // Fallback default image resolving absolute URL if relative
  const getAbsoluteImageUrl = (imgSrc) => {
    if (!imgSrc) return `${window.location.origin}/logo1.webp`;
    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://') || imgSrc.startsWith('data:')) {
      return imgSrc;
    }
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    const cleanBase = BACKEND_URL.replace(/\/api$/, '').replace(/\/$/, '');
    return `${cleanBase}/${imgSrc.replace(/^\//, '')}`;
  };

  const truncate = (str, maxLength) => {
    if (!str || typeof str !== 'string') return '';
    return str.length > maxLength ? str.substring(0, maxLength) : str;
  };

  const rawTitle = seo?.title || title || defaultTitle;
  const rawDescription = seo?.description || description || defaultDescription;

  const seoTitle = truncate(rawTitle, 120);
  const seoDescription = truncate(rawDescription, 160);
  const seoKeywords = seo?.keywords || keywords || defaultKeywords;
  const seoImage = getAbsoluteImageUrl(seo?.image || image);
  const currentUrl = seo?.canonicalUrl || url || window.location.href;

  return (
    <Helmet>
      {/* Search Engine Robots Indexing Instructions */}
      {isProduction ? (
        <meta name="robots" content="index, follow" />
      ) : (
        <meta name="robots" content="noindex, nofollow" />
      )}

      {/* Primary HTML Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {seoKeywords && <meta name="keywords" content={Array.isArray(seoKeywords) ? seoKeywords.join(', ') : seoKeywords} />}

      {/* Open Graph / Facebook Previews */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
};

export default SEO;
