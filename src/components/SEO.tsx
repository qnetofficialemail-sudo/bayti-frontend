import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
  currency?: string;
}

const SITE_NAME = "Bayti | بيتي";
const DEFAULT_DESC = "Discover handmade crafts, perfumes, abayas, home-cooked meals and more from local UAE home sellers. اكتشف منتجات محلية من بائعين في الإمارات.";
const DEFAULT_IMAGE = "https://bayti-frontend-three.vercel.app/logo192.png";
const BASE_URL = "https://bayti-frontend-three.vercel.app";

export default function SEO({ title, description, image, url, type = "website", price, currency = "AED" }: SEOProps) {
  const fullTitle = title ? `${title} | Bayti بيتي` : SITE_NAME;
  const fullDesc = description || DEFAULT_DESC;
  const fullImage = image || DEFAULT_IMAGE;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <link rel="canonical" href={fullUrl} />
      <html lang="ar" />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="ar_AE" />
      <meta property="og:locale:alternate" content="en_AE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={fullImage} />

      {/* Product specific */}
      {price && <meta property="product:price:amount" content={String(price)} />}
      {price && <meta property="product:price:currency" content={currency} />}
    </Helmet>
  );
}
