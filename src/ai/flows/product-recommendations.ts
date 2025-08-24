'use server';

/**
 * @fileOverview A product recommendation AI agent.
 *
 * - productRecommendations - A function that handles the product recommendation process.
 * - ProductRecommendationsInput - The input type for the productRecommendations function.
 * - ProductRecommendationsOutput - The return type for the productRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationsInputSchema = z.object({
  productId: z.string().describe('The ID of the product to find recommendations for.'),
  productTitle: z.string().describe('The title of the product.'),
  productDescription: z.string().describe('The description of the product.'),
  productCategory: z.string().describe('The category of the product.'),
  limit: z.number().default(3).describe('The maximum number of recommendations to return.'),
});
export type ProductRecommendationsInput = z.infer<typeof ProductRecommendationsInputSchema>;

const ProductRecommendationsOutputSchema = z.array(
  z.object({
    id: z.string().describe('The ID of the recommended product.'),
    title: z.string().describe('The title of the recommended product.'),
    reason: z.string().describe('The AI reason for recommending this product.'),
    slug: z.string().describe('A URL-friendly slug for the product title.'),
  })
);
export type ProductRecommendationsOutput = z.infer<typeof ProductRecommendationsOutputSchema>;

export async function productRecommendations(input: ProductRecommendationsInput): Promise<ProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: ProductRecommendationsInputSchema},
  output: {schema: ProductRecommendationsOutputSchema},
  prompt: `You are a helpful shopping assistant whose job is to recommend related products to the user.

  Based on the details of the current product, recommend {{limit}} other trendy Korean stationary products that the user might be interested in.

  Product ID: {{productId}}
  Product Title: {{productTitle}}
  Product Description: {{productDescription}}
  Product Category: {{productCategory}}

  Return a JSON array of products with the following fields:
  - id: The ID of the recommended product.
  - title: The title of the recommended product.
  - reason: A short explanation of why this product is being recommended. Be specific about what the relationship is between the current product and the recommended product.
  - slug: A URL-friendly slug for the product title.
  `,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: ProductRecommendationsInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
