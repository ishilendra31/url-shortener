require('dotenv').config()
const express = require("express")
const path = require("path")
const urlRoute = require("./routes/url")
const { connectToMongoDB } = require("./connect")

const app = express()
const PORT = process.env.PORT || 8000
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/short-url"

connectToMongoDB(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

app.use("/api", urlRoute)

// Redirect short URLs
app.get("/:shortId", async (req, res, next) => {
  if (req.params.shortId === "favicon.ico") return next()
  const { handleRedirectURL } = require("./controllers/url")
  return handleRedirectURL(req, res)
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server Started at Port: ${PORT}`)
})
