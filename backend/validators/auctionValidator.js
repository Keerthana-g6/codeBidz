const { z } = require('zod');

const createAuctionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url().optional().or(z.literal('')),
  startTime: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start time'),
  endTime: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end time'),
  minimumBid: z.number().int().positive('Minimum bid must be positive'),
  category: z.string().optional().default('General'),
  reservePrice: z.number().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  bidIncrement: z.number().int().positive().optional().default(1),
});

module.exports = { createAuctionSchema };