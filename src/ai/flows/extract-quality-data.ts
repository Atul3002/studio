
'use server';
/**
 * @fileOverview An AI flow for extracting text from an image.
 *
 * - extractQualityData - A function that handles the text extraction process.
 * - ExtractQualityDataInput - The input type for the extractQualityData function.
 * - ExtractedQualityData - The return type for the extractQualityData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractQualityDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a manufactured part or component, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractQualityDataInput = z.infer<typeof ExtractQualityDataInputSchema>;

const ExtractedQualityDataSchema = z.object({
  extractedText: z.string().describe('All the text extracted from the image.'),
});
export type ExtractedQualityData = z.infer<typeof ExtractedQualityDataSchema>;

export async function extractQualityData(input: ExtractQualityDataInput): Promise<ExtractedQualityData> {
  return extractQualityDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractQualityDataPrompt',
  input: {schema: ExtractQualityDataInputSchema},
  output: {schema: ExtractedQualityDataSchema},
  prompt: `You are an OCR (Optical Character Recognition) engine. Your task is to extract any and all text visible in the provided image. Return the extracted text in the 'extractedText' field.

Photo of the component: {{media url=photoDataUri}}`,
});

const extractQualityDataFlow = ai.defineFlow(
  {
    name: 'extractQualityDataFlow',
    inputSchema: ExtractQualityDataInputSchema,
    outputSchema: ExtractedQualityDataSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
