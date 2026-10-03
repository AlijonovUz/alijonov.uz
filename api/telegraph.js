export default async function handler(req, res) {
  // Security & Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const token = process.env.VITE_TELEGRAPH_TOKEN || process.env.TELEGRAPH_TOKEN;
  const { action, slug } = req.query;

  if (!token) {
    return res.status(500).json({ ok: false, error: 'Telegraph token is not configured on server' });
  }

  try {
    if (action === 'page_list') {
      const response = await fetch(
        `https://api.telegra.ph/getPageList?access_token=${token}&limit=100`
      );
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'page' && slug) {
      const response = await fetch(
        `https://api.telegra.ph/getPage/${encodeURIComponent(slug)}?return_content=true`
      );
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ ok: false, error: 'Invalid action or missing slug' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
