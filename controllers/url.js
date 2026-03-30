const shortid = require("shortid")
const URLModel = require("../models/url")

function isValidURL(str) {
  try {
    new globalThis.URL(str)
    return true
  } catch {
    return false
  }
}

async function handleGenerateNewShortURL(req, res) {
  const body = req.body
  if (!body.url) {
    return res.status(400).json({ error: "url is required" })
  }

  // Auto-prefix https:// if missing
  if (!isValidURL(body.url)) {
    if (isValidURL("https://" + body.url)) {
      body.url = "https://" + body.url
    } else {
      return res.status(400).json({ error: "Invalid URL format" })
    }
  }

  let shortID = body.customAlias || shortid()

  // Check if custom alias already exists
  if (body.customAlias) {
    const existing = await URLModel.findOne({ shortId: body.customAlias })
    if (existing) {
      return res.status(409).json({ error: "Custom alias already in use" })
    }
  }

  await URLModel.create({
    shortId: shortID,
    redirectURL: body.url,
    customAlias: body.customAlias || null,
    visitHistory: [],
  })

  const baseURL = `${req.protocol}://${req.get("host")}`
  return res.json({
    id: shortID,
    shortURL: `${baseURL}/${shortID}`,
    originalURL: body.url,
  })
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId
  const result = await URLModel.findOne({ shortId })

  if (!result) {
    return res.status(404).json({ error: "Short URL not found" })
  }

  return res.json({
    shortId: result.shortId,
    originalURL: result.redirectURL,
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
    createdAt: result.createdAt,
  })
}

async function handleGetAllURLs(req, res) {
  const urls = await URLModel.find({}).sort({ createdAt: -1 }).limit(20)
  return res.json(urls)
}

async function handleDeleteURL(req, res) {
  const shortId = req.params.shortId
  const result = await URLModel.findOneAndDelete({ shortId })
  if (!result) {
    return res.status(404).json({ error: "Short URL not found" })
  }
  return res.json({ message: "URL deleted successfully" })
}

async function handleRedirectURL(req, res) {
  const shortId = req.params.shortId

  const entry = await URLModel.findOneAndUpdate(
    { shortId },
    { $push: { visitHistory: { timestamp: Date.now() } } }
  )

  if (!entry) {
    return res.status(404).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:50px">
        <h2>404 - Short URL not found</h2>
        <p><a href="/">Go back to home</a></p>
      </body></html>
    `)
  }

  res.redirect(entry.redirectURL)
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleGetAllURLs,
  handleDeleteURL,
  handleRedirectURL,
}
