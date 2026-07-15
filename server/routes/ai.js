const express = require('express');
const Anthropic = require("@anthropic-ai/sdk");
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper: mock AI response when no API key
function mockAIResponse(prompt, type) {
  const responses = {
    copilot: `Great question! Here's my startup advice:\n\n**Key Insights:**\n1. Focus on solving a real problem that people are willing to pay for\n2. Start with a minimum viable product (MVP) and iterate based on user feedback\n3. Build a strong founding team with complementary skills\n4. Validate your market before scaling\n\n**Action Items:**\n- Conduct 20+ customer interviews this week\n- Define your unique value proposition clearly\n- Set measurable KPIs for the next 30 days\n- Research your top 5 competitors thoroughly\n\nWould you like me to dive deeper into any of these areas?`,
    
    'pitch-analysis': JSON.stringify({
      overallScore: 78,
      marketClarity: { score: 82, feedback: 'Your market definition is clear but could benefit from more specific TAM/SAM/SOM data with sources.' },
      businessModel: { score: 75, feedback: 'Revenue model is viable. Consider adding unit economics and projected margins.' },
      teamStrength: { score: 85, feedback: 'Strong founding team with relevant experience. Consider adding an advisory board.' },
      competitiveAdvantage: { score: 70, feedback: 'Differentiation is present but could be articulated more clearly. Add a competitive matrix.' },
      financials: { score: 72, feedback: 'Financial projections are optimistic. Include sensitivity analysis and key assumptions.' },
      suggestions: [
        'Add customer testimonials or pilot results',
        'Include a clear go-to-market strategy timeline',
        'Show traction metrics more prominently',
        'Add a slide on regulatory considerations if applicable',
        'Include your ask and use of funds breakdown'
      ]
    }),

    'validate-idea': JSON.stringify({
      viabilityScore: 73,
      marketDemand: { rating: 'High', analysis: 'Growing market with increasing demand. The problem you\'re solving affects millions of users globally.' },
      competition: { rating: 'Medium', analysis: 'Several competitors exist but none dominate the space. There\'s room for a differentiated solution.' },
      monetization: { strategies: ['SaaS subscription model', 'Freemium with premium features', 'Enterprise licensing', 'Marketplace commission'], recommended: 'SaaS subscription with tiered pricing' },
      improvements: [
        'Consider a niche market focus initially before expanding',
        'Build viral loops into your product from day one',
        'Develop strategic partnerships early',
        'Focus on data moats as a competitive advantage'
      ],
      risks: ['Market timing risk', 'Customer acquisition cost', 'Regulatory changes'],
      nextSteps: ['Build a landing page to test demand', 'Run a pilot with 10 beta users', 'Develop a detailed financial model']
    }),

    'predict-success': JSON.stringify({
      successScore: 68,
      riskLevel: 'Medium',
      growthPotential: 'High',
      factors: {
        teamStrength: { score: 75, weight: 0.25 },
        marketSize: { score: 80, weight: 0.20 },
        productReadiness: { score: 60, weight: 0.20 },
        userTraction: { score: 55, weight: 0.20 },
        fundingStatus: { score: 70, weight: 0.15 }
      },
      recommendations: [
        'Strengthen product-market fit through more user testing',
        'Accelerate user acquisition with growth hacking strategies',
        'Consider bringing on a technical co-founder',
        'Seek mentorship from founders who\'ve scaled in your industry'
      ]
    }),

    'mvp-builder': JSON.stringify({
      suggestedStack: {
        frontend: ['React', 'Next.js', 'TailwindCSS'],
        backend: ['Node.js', 'Express', 'MongoDB'],
        deployment: ['Vercel', 'AWS', 'Docker'],
        tools: ['GitHub', 'Figma', 'Notion']
      },
      coreFeatures: [
        { name: 'User Authentication', priority: 'P0', effort: '1 week' },
        { name: 'Core Product Flow', priority: 'P0', effort: '2 weeks' },
        { name: 'Payment Integration', priority: 'P1', effort: '1 week' },
        { name: 'Analytics Dashboard', priority: 'P1', effort: '1 week' },
        { name: 'Admin Panel', priority: 'P2', effort: '3 days' }
      ],
      roadmap: [
        { phase: 'Week 1-2', tasks: 'Setup, Auth, Core UI' },
        { phase: 'Week 3-4', tasks: 'Core Features, API Integration' },
        { phase: 'Week 5-6', tasks: 'Testing, Polish, Launch Prep' }
      ],
      estimatedBuildTime: '6 weeks',
      estimatedCost: '$5,000 - $15,000'
    })
  };
  return responses[type] || responses.copilot;
}

// AI Copilot (chat)
router.post('/copilot', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
      
      const chatMessages = (context || []).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));
      chatMessages.push({ role: "user", content: message });

      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        system: "You are an expert startup advisor with deep experience in technology, fundraising, scaling, and product development. Provide specific, actionable advice. Format responses with headers and bullet points when helpful.",
        messages: chatMessages
      });
      return res.json({ response: completion.content[0].text });
    }
    
    // Mock response for demo
    res.json({ response: mockAIResponse(message, 'copilot') });
  } catch (error) {
    console.error("Claude Copilot Error:", error);
    res.json({ response: mockAIResponse(req.body.message, 'copilot') });
  }
});

// Analyze pitch deck
router.post('/analyze-pitch', auth, async (req, res) => {
  try {
    const { pitchContent } = req.body;
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        system: "Analyze this pitch deck content and return a JSON object with: overallScore (0-100), marketClarity {score, feedback}, businessModel {score, feedback}, teamStrength {score, feedback}, competitiveAdvantage {score, feedback}, financials {score, feedback}, suggestions (array of strings). Return ONLY valid JSON.",
        messages: [{ role: "user", content: pitchContent || "General startup pitch" }]
      });
      
      let text = completion.content[0].text;
      if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
      else if (text.includes('```')) text = text.split('```')[1].split('```')[0];
      
      try {
        return res.json({ analysis: JSON.parse(text.trim()) });
      } catch {
        return res.json({ analysis: JSON.parse(mockAIResponse('', 'pitch-analysis')) });
      }
    }
    res.json({ analysis: JSON.parse(mockAIResponse('', 'pitch-analysis')) });
  } catch (error) {
    console.error("Claude Pitch Analysis Error:", error);
    res.json({ analysis: JSON.parse(mockAIResponse('', 'pitch-analysis')) });
  }
});

// Validate idea
router.post('/validate-idea', auth, async (req, res) => {
  try {
    const { idea } = req.body;
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        system: "Analyze this startup idea and return a JSON object with: viabilityScore (0-100), marketDemand {rating, analysis}, competition {rating, analysis}, monetization {strategies (array), recommended}, improvements (array), risks (array), nextSteps (array). Return ONLY valid JSON.",
        messages: [{ role: "user", content: idea || "General startup idea" }]
      });

      let text = completion.content[0].text;
      if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
      else if (text.includes('```')) text = text.split('```')[1].split('```')[0];

      try {
        return res.json({ validation: JSON.parse(text.trim()) });
      } catch (error) {
        return res.json({ validation: JSON.parse(mockAIResponse('', 'validate-idea')) });
      }
    }
    res.json({ validation: JSON.parse(mockAIResponse('', 'validate-idea')) });
  } catch (error) {
    console.error("Claude Idea Validation Error:", error);
    res.json({ validation: JSON.parse(mockAIResponse('', 'validate-idea')) });
  }
});

// Predict success
router.post('/predict-success', auth, async (req, res) => {
  try {
    const { startupData } = req.body;
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        system: "Analyze this startup data and predict success. Return JSON with: successScore (0-100), riskLevel (Low/Medium/High), growthPotential (Low/Medium/High/Very High), factors {teamStrength {score, weight}, marketSize {score, weight}, productReadiness {score, weight}, userTraction {score, weight}, fundingStatus {score, weight}}, recommendations (array). Return ONLY valid JSON.",
        messages: [{ role: "user", content: JSON.stringify(startupData) }]
      });

      let text = completion.content[0].text;
      if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
      else if (text.includes('```')) text = text.split('```')[1].split('```')[0];

      try {
        return res.json({ prediction: JSON.parse(text.trim()) });
      } catch {
        return res.json({ prediction: JSON.parse(mockAIResponse('', 'predict-success')) });
      }
    }
    res.json({ prediction: JSON.parse(mockAIResponse('', 'predict-success')) });
  } catch (error) {
    console.error("Claude Predict Success Error:", error);
    res.json({ prediction: JSON.parse(mockAIResponse('', 'predict-success')) });
  }
});

// MVP Builder
router.post('/mvp-builder', auth, async (req, res) => {
  try {
    const { concept } = req.body;
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        system: "Based on this startup concept, suggest an MVP plan. Return JSON with: suggestedStack {frontend, backend, deployment, tools (arrays)}, coreFeatures (array of {name, priority, effort}), roadmap (array of {phase, tasks}), estimatedBuildTime, estimatedCost. Return ONLY valid JSON.",
        messages: [{ role: "user", content: concept || "General SaaS product" }]
      });

      let text = completion.content[0].text;
      if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
      else if (text.includes('```')) text = text.split('```')[1].split('```')[0];

      try {
        return res.json({ mvpPlan: JSON.parse(text.trim()) });
      } catch {
        return res.json({ mvpPlan: JSON.parse(mockAIResponse('', 'mvp-builder')) });
      }
    }
    res.json({ mvpPlan: JSON.parse(mockAIResponse('', 'mvp-builder')) });
  } catch (error) {
    console.error("Claude MVP Builder Error:", error);
    res.json({ mvpPlan: JSON.parse(mockAIResponse('', 'mvp-builder')) });
  }
});

module.exports = router;
