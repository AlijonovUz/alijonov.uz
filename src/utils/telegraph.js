import axios from 'axios';
import { checkIsDevToolsOpen } from '../hooks/useDevToolsDetector';

const TELEGRAPH_TOKEN = import.meta.env.VITE_TELEGRAPH_TOKEN;
const CACHE_PREFIX = 'tg_cache_';
const LIST_CACHE_KEY = `${CACHE_PREFIX}page_list`;

// Add request interceptor to prevent any Telegraph requests if DevTools is open
axios.interceptors.request.use((config) => {
  if (checkIsDevToolsOpen()) {
    return Promise.reject(new Error('DevTools blocked request'));
  }
  return config;
});

/**
 * Get item from cache (regardless of expiration, for instant SWR render)
 */
export function getCachedData(key) {
  if (checkIsDevToolsOpen()) return null;

  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    return item.data;
  } catch (e) {
    console.warn('Error reading from cache:', e);
    return null;
  }
}

/**
 * Save item to cache
 */
export function setCachedData(key, data) {
  if (checkIsDevToolsOpen()) return;

  try {
    const item = {
      data,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn('Error saving to cache:', e);
  }
}

/**
 * Fetch fresh list from Telegraph API
 */
export async function fetchFreshPageList() {
  if (checkIsDevToolsOpen()) {
    return [];
  }

  const response = await axios.get(
    `https://api.telegra.ph/getPageList?access_token=${TELEGRAPH_TOKEN}&limit=100`
  );

  if (response.data && response.data.ok) {
    const pages = response.data.result.pages.filter((page) => {
      const title = (page.title || '').toLowerCase();
      return (
        !title.includes('deleted') &&
        title !== "o'chirilgan" &&
        title !== 'ochirilgan'
      );
    });
    setCachedData(LIST_CACHE_KEY, pages);
    return pages;
  }

  throw new Error(response.data?.error || 'Failed to fetch Telegraph page list');
}

/**
 * Fetch list with Stale-While-Revalidate (SWR) support:
 * 1. Returns cached list immediately (if available) for 0ms load time.
 * 2. Fetches fresh list in the background and calls onFreshData callback if data updated.
 */
export async function getTelegraphPageList(onFreshData) {
  if (checkIsDevToolsOpen()) {
    return [];
  }

  const cached = getCachedData(LIST_CACHE_KEY);

  // Background fetch (Revalidate)
  const networkPromise = fetchFreshPageList()
    .then((freshPages) => {
      if (onFreshData && !checkIsDevToolsOpen()) {
        onFreshData(freshPages);
      }
      return freshPages;
    })
    .catch((err) => {
      console.warn('Background fetch failed:', err);
      return cached || [];
    });

  // If cache exists, return it immediately; otherwise wait for network
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  return await networkPromise;
}

/**
 * Fetch fresh post from Telegraph API
 */
export async function fetchFreshPost(slug) {
  if (checkIsDevToolsOpen()) {
    return null;
  }

  const cacheKey = `${CACHE_PREFIX}post_${slug}`;
  const response = await axios.get(
    `https://api.telegra.ph/getPage/${slug}?return_content=true`
  );

  if (response.data && response.data.ok) {
    const post = response.data.result;
    const title = (post.title || '').toLowerCase();
    if (
      title.includes('deleted') ||
      title === "o'chirilgan" ||
      title === 'ochirilgan'
    ) {
      return null;
    }
    setCachedData(cacheKey, post);
    return post;
  }

  return null;
}

/**
 * Fetch single post with SWR support
 */
export async function getTelegraphPost(slug, onFreshData) {
  if (checkIsDevToolsOpen()) {
    return null;
  }

  const cacheKey = `${CACHE_PREFIX}post_${slug}`;
  const cached = getCachedData(cacheKey);

  // Background fetch (Revalidate)
  const networkPromise = fetchFreshPost(slug)
    .then((freshPost) => {
      if (onFreshData && freshPost && !checkIsDevToolsOpen()) {
        onFreshData(freshPost);
      }
      return freshPost;
    })
    .catch((err) => {
      console.warn('Background post fetch failed:', err);
      return cached;
    });

  if (cached) {
    return cached;
  }

  return await networkPromise;
}
