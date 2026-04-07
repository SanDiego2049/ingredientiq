const { GoogleGenerativeAI } = require('@google/generative-ai')
const { buildAnalysisPrompt } = require('../utils/geminiPrompt')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function analyseIngredients(ingredients) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
  })

  const prompt = buildAnalysisPrompt(ingredients)
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const parsed = JSON.parse(text)
    return parsed
  } catch {
    throw new Error('Gemini returned invalid JSON')
  }
}

module.exports = { analyseIngredients }
