import axios from 'axios';
import { checkIsDevToolsOpen } from '../hooks/useDevToolsDetector';

const TELEGRAPH_TOKEN = import.meta.env.VITE_TELEGRAPH_TOKEN;
const CACHE_PREFIX = 'tg_cache_';
const LIST_CACHE_KEY = `${CACHE_PREFIX}page_list`;

// Request interceptor to block all API requests if DevTools is open
axios.interceptors.request.use((config) => {
  if (checkIsDevToolsOpen()) {
    return Promise.reject(new Error('DevTools blocked request'));
  }
  return config;
});

/**
 * Get item from cache
 */
export function getCachedData(key) {
  if (checkIsDevToolsOpen()) return null;

  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    return item.data;
  } catch (e) {
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
    // ignore
  }
}

/**
 * Fetch fresh list from server proxy or fallback
 */
export async function fetchFreshPageList() {
  if (checkIsDevToolsOpen()) {
    return [];
  }

  let data = null;

  // 1. Try serverless proxy first (hides token and api.telegra.ph from network tab)
  try {
    const response = await axios.get('/api/telegraph?action=page_list');
    data = response.data;
  } catch {
    // 2. Fallback to direct client call if running in local dev without proxy
    if (TELEGRAPH_TOKEN) {
      try {
        const response = await axios.get(
          `https://api.telegra.ph/getPageList?access_token=${TELEGRAPH_TOKEN}&limit=100`
        );
        data = response.data;
      } catch {
        // ignore
      }
    }
  }

  if (data && data.ok) {
    const pages = (data.result?.pages || []).filter((page) => {
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

  return [];
}

/**
 * Fetch list with SWR
 */
export async function getTelegraphPageList(onFreshData) {
  if (checkIsDevToolsOpen()) {
    return [];
  }

  const cached = getCachedData(LIST_CACHE_KEY);

  const networkPromise = fetchFreshPageList()
    .then((freshPages) => {
      if (onFreshData && !checkIsDevToolsOpen()) {
        onFreshData(freshPages);
      }
      return freshPages;
    })
    .catch(() => cached || []);

  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  return await networkPromise;
}

/**
 * Fetch fresh post from server proxy or fallback
 */
export async function fetchFreshPost(slug) {
  if (checkIsDevToolsOpen()) {
    return null;
  }

  const cacheKey = `${CACHE_PREFIX}post_${slug}`;
  let data = null;

  try {
    const response = await axios.get(`/api/telegraph?action=page&slug=${encodeURIComponent(slug)}`);
    data = response.data;
  } catch {
    if (TELEGRAPH_TOKEN) {
      try {
        const response = await axios.get(
          `https://api.telegra.ph/getPage/${slug}?return_content=true`
        );
        data = response.data;
      } catch {
        // ignore
      }
    }
  }

  if (data && data.ok) {
    const post = data.result;
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
 * Fetch single post with SWR
 */
export async function getTelegraphPost(slug, onFreshData) {
  if (checkIsDevToolsOpen()) {
    return null;
  }

  const cacheKey = `${CACHE_PREFIX}post_${slug}`;
  const cached = getCachedData(cacheKey);

  const networkPromise = fetchFreshPost(slug)
    .then((freshPost) => {
      if (onFreshData && freshPost && !checkIsDevToolsOpen()) {
        onFreshData(freshPost);
      }
      return freshPost;
    })
    .catch(() => cached);

  if (cached) {
    return cached;
  }

  return await networkPromise;
}
