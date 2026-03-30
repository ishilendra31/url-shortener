const express = require("express")
const {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleGetAllURLs,
  handleDeleteURL,
} = require("../controllers/url")

const router = express.Router()

router.post("/shorten", handleGenerateNewShortURL)
router.get("/analytics/:shortId", handleGetAnalytics)
router.get("/urls", handleGetAllURLs)
router.delete("/urls/:shortId", handleDeleteURL)

module.exports = router
