
'use server';
/**
 * @fileOverview An AI flow for extracting quality control data from an image.
 *
 * - extractQualityData - A function that handles the quality data extraction process.
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
  partId: z.string().describe('The identification number or name of the part, if visible.'),
  serialNumber: z.string().describe('The serial number of the part, if visible.'),
  dimensions: z.object({
    length: z.string().describe('The measured length of the part in millimeters.'),
    width: z.string().describe('The measured width of the part in millimeters.'),
    height: z.string().describe('The measured height of the part in millimeters.'),
  }).describe('The measured dimensions of the part.'),
  defects: z.array(z.object({
    type: z.string().describe('The type of defect found (e.g., scratch, dent, crack, discoloration).'),
    description: z.string().describe('A brief description of the defect.'),
    location: z.string().describe('The location of the defect on the part.'),
  })).describe('A list of any defects identified on the part.'),
  overallQuality: z.enum(['Pass', 'Fail', 'Review']).describe('The overall quality assessment of the part based on the analysis.'),
});
export type ExtractedQualityData = z.infer<typeof ExtractedQualityDataSchema>;

export async function extractQualityData(input: ExtractQualityDataInput): Promise<ExtractedQualityData> {
  return extractQualityDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractQualityDataPrompt',
  input: {schema: ExtractQualityDataInputSchema},
  output: {schema: ExtractedQualityDataSchema},
  prompt: `You are a highly-trained quality control inspector for a manufacturing company. Your task is to analyze the provided image of a component and extract specific quality control information.

Carefully examine the image for any identifying numbers, dimensions, and visual defects. Measure any visible dimensions accurately.

Based on your analysis, provide a structured report of your findings. Identify the part, list any defects you find with details, and give an overall quality assessment.

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
