// src/components/SEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

// --- Configuration ---
// Set your base website URL and default values here
const BASE_URL = "https://artx3d.vercel.app"; // Your deployed website URL
const DEFAULT_TITLE = "ArtX3D - Online 3D Editor & Creator";
const DEFAULT_DESCRIPTION = "Create, share, and explore stunning 3D art with ArtX3D's intuitive web-based editor.";
const DEFAULT_IMAGE = "/3d/preview.jpg"; // Path to your default preview image in the public folder
const DEFAULT_KEYWORDS = "3D editor, online 3D editor, web 3D, 3D creator, 3D modeling, digital art, ArtX3D";
const DEFAULT_AUTHOR = "ArtX3D Team"; // Optional: Your name or team name
// --- End Configuration ---

/**
 * A reusable component to dynamically set SEO and social media meta tags for different pages.
 *
 * @param {object} props - The component props.
 * @param {string} [props.title=DEFAULT_TITLE] - The title of the page (for browser tab and sharing).
 * @param {string} [props.description=DEFAULT_DESCRIPTION] - A short description of the page content.
 * @param {string} [props.keywords=DEFAULT_KEYWORDS] - Comma-separated keywords relevant to the page.
 * @param {string} [props.image=DEFAULT_IMAGE] - The path (relative to public folder, e.g., /3d/image.jpg) or full URL to the preview image.
 * @param {string} [props.urlPath=""] - The specific path for this page (e.g., "/editor", "/home"). Defaults to the base URL.
 * @param {string} [props.author=DEFAULT_AUTHOR] - The author of the content.
 * @param {string} [props.ogType="website"] - The Open Graph type (e.g., "website", "article").
 */
const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  urlPath = "", // Default to empty path, meaning base URL
  author = DEFAULT_AUTHOR,
  ogType = "website",
}) => {

  // Construct the full canonical URL for the page
  // Ensure no double slashes and handle empty path correctly
  const canonicalUrl = `${BASE_URL}${urlPath === '/' ? '' : urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;

  // Construct the full image URL
  // Assumes images passed without http/https are relative to the public folder
  const fullImageUrl = image.startsWith('http')
    ? image
    : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;

  return (
    <Helmet>
      {/* --- Primary Meta Tags --- */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />

      {/* --- Open Graph / Facebook --- */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      {/* Optional: Add og:image:width and og:image:height if you know the dimensions */}
      {/* <meta property="og:image:width" content="1200" /> */}
      {/* <meta property="og:image:height" content="630" /> */}
      {/* Optional: <meta property="og:site_name" content="ArtX3D" /> */}


      {/* --- Twitter --- */}
      {/* <meta name="twitter:card" content="summary_large_image" /> */}
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      {/* Optional: Add Twitter site/creator handles if you have them */}
      {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}
      {/* <meta name="twitter:creator" content="@CreatorHandle" /> */}

    </Helmet>
  );
};

export default SEO;