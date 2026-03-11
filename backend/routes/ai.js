const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect, adminOnly, bidderOnly } = require('../middleware/auth');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/generate-description - Admin: AI auction description generator
router.post('/generate-description', protect, adminOnly, async (req, res) => {
  try {
    const { title, category, keywords } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are an expert auction copywriter. Generate a compelling, concise auction listing description (max 3 sentences, 80 words) for:
Title: ${title}
Category: ${category || 'General'}
Keywords: ${keywords || 'none'}

Write enthusiastically but honestly. Focus on value and appeal. Do not include price. Output only the description, nothing else.`
      }]
    });

    const description = message.content[0].text.trim();
    res.json({ description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/bid-suggestion - Bidder: AI smart bid suggestion with reasoning
router.post('/bid-suggestion', protect, bidderOnly, async (req, res) => {
  try {
    const { auctionTitle, currentBid, minimumBid, endTime, availableCredits, totalBids } = req.body;

    const minutesLeft = Math.max(0, Math.floor((new Date(endTime) - new Date()) / 60000));

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are a smart auction bidding advisor. Give a short, practical bid suggestion.

Auction: ${auctionTitle}
Current highest bid: ${currentBid || minimumBid} credits
Your available credits: ${availableCredits}
Time remaining: ${minutesLeft} minutes
Total bids placed: ${totalBids}

Suggest a bid amount and explain why in 1-2 sentences. Be specific with a number. Format: "Bid [X] credits - [reason]". Output only this line.`
      }]
    });

    const suggestion = message.content[0].text.trim();
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
