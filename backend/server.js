require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
)

// Parse JSON bodies
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IngredientIQ API is running' })
})

// Routes (we will add these as we build)
// app.use('/api/auth', require('./src/routes/authRoutes'))
// app.use('/api/scans', require('./src/routes/scanRoutes'))

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
