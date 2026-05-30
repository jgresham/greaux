import { useEffect } from 'react';

const SITE_NAME = 'greaux';
const BASE_PATH = import.meta.env.BASE_URL || '/';

export const PAGE_META = {
  home: {
    title: 'greaux | Interactive Financial Projection Models',
    description: 'Interactive financial projection dashboards for companies and protocols. Adjust assumptions, compare revenue drivers, and see outcomes.',
    path: '',
    image: 'og-greaux.svg',
    imageAlt: 'greaux financial projection dashboard preview',
    keywords: 'greaux, financial projections, revenue dashboard, company model, protocol model, investing dashboard',
  },
  tesla: {
    title: 'Tesla Revenue Growth Dashboard | greaux',
    description: 'Interactive Tesla revenue model with automotive, energy, services, Robotaxi, and Optimus projection assumptions.',
    path: 'tesla/',
    image: 'og-tesla.svg',
    imageAlt: 'Tesla revenue growth dashboard preview',
    keywords: 'Tesla revenue, TSLA dashboard, Tesla projections, Robotaxi, Optimus, financial model',
    organization: 'Tesla, Inc.',
  },
  spacex: {
    title: 'SpaceX Revenue Growth Dashboard | greaux',
    description: 'Interactive SpaceX projection model for estimated revenue and earnings across Starlink, launch services, government systems, Dragon, and Starship.',
    path: 'spacex/',
    image: 'og-spacex.svg',
    imageAlt: 'SpaceX revenue growth dashboard preview',
    keywords: 'SpaceX dashboard, SpaceX revenue projection, Starlink revenue, Falcon launches, Starship, private company financial model',
    organization: 'SpaceX',
  },
  uniswap: {
    title: 'Uniswap Fee Switch Growth Dashboard | greaux',
    description: 'Interactive Uniswap projection model for DEX volume, swap fees, fee-switch capture, protocol earnings, and implied UNI value.',
    path: 'uniswap/',
    image: 'og-uniswap.svg',
    imageAlt: 'Uniswap fee switch growth dashboard preview',
    keywords: 'Uniswap dashboard, UNI valuation, Uniswap fee switch, DEX volume, protocol revenue, DeFi financial model',
    organization: 'Uniswap Protocol',
  },
  lilly: {
    title: 'Eli Lilly Revenue Growth Dashboard | greaux',
    description: 'Interactive Eli Lilly projection model for Mounjaro, Zepbound, Foundayo, oncology, immunology, earnings, valuation, and implied LLY share price.',
    path: 'lilly/',
    image: 'og-lilly.svg',
    imageAlt: 'Eli Lilly revenue growth dashboard preview',
    keywords: 'Eli Lilly dashboard, LLY revenue projection, Mounjaro forecast, Zepbound forecast, Foundayo forecast, pharma financial model',
    organization: 'Eli Lilly and Company',
  },
  nvidia: {
    title: 'Nvidia Revenue Growth Dashboard | greaux',
    description: 'Interactive Nvidia projection model for Data Center, Gaming, Professional Visualization, Automotive, earnings, valuation, and implied NVDA share price.',
    path: 'nvidia/',
    image: 'og-nvidia.svg',
    imageAlt: 'Nvidia revenue growth dashboard preview',
    keywords: 'Nvidia dashboard, NVDA revenue projection, Data Center forecast, Blackwell GPU, AI infrastructure, financial model',
    organization: 'NVIDIA Corporation',
  },
};

function absoluteFromBase(path = '') {
  const cleanPath = path.replace(/^\//, '');

  if (typeof window === 'undefined') {
    return `${BASE_PATH}${cleanPath}`;
  }

  const baseUrl = new URL(BASE_PATH, window.location.origin);
  return new URL(cleanPath, baseUrl).toString();
}

function upsertMeta(attribute, key, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let tag = document.getElementById(id);
  if (!tag) {
    tag = document.createElement('script');
    tag.id = id;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }

  tag.textContent = JSON.stringify(data);
}

export default function PageMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  keywords,
  organization,
}) {
  useEffect(() => {
    const pageUrl = absoluteFromBase(path);
    const imageUrl = absoluteFromBase(image);
    const siteUrl = absoluteFromBase('');

    document.title = title;
    upsertLink('canonical', pageUrl);

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', 'index, follow');
    upsertMeta('name', 'theme-color', '#0a0a0f');
    upsertMeta('name', 'application-name', SITE_NAME);
    upsertMeta('name', 'apple-mobile-web-app-title', SITE_NAME);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', pageUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:secure_url', imageUrl);
    upsertMeta('property', 'og:image:type', 'image/svg+xml');
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:image:alt', imageAlt);
    upsertMeta('property', 'og:locale', 'en_US');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('name', 'twitter:image:alt', imageAlt);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: pageUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: siteUrl,
      },
    };

    if (organization) {
      jsonLd.about = {
        '@type': 'Organization',
        name: organization,
      };
    }

    upsertJsonLd('greaux-page-schema', jsonLd);
  }, [description, image, imageAlt, keywords, organization, path, title]);

  return null;
}
