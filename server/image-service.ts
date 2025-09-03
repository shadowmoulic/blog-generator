import axios from "axios";

export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  width: number;
  height: number;
}

export async function generateImagesWithPollination(
  prompts: string[],
  options: Partial<ImageGenerationRequest> = {}
): Promise<GeneratedImage[]> {
  const defaultOptions = {
    width: 1024,
    height: 1024,
    model: "flux",
    ...options
  };

  const results: GeneratedImage[] = [];

  for (const prompt of prompts) {
    try {
      // Using pollination.ai free image generation
      const response = await axios.post("https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt), {}, {
        params: {
          width: defaultOptions.width,
          height: defaultOptions.height,
          model: defaultOptions.model,
          nologo: "true",
          private: "true"
        },
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // Convert the response to a data URL for display
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      results.push({
        url: imageUrl,
        prompt,
        width: defaultOptions.width!,
        height: defaultOptions.height!
      });

    } catch (error) {
      console.error(`Image generation failed for prompt: ${prompt}`, error);
      // Create a fallback placeholder image URL
      results.push({
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${defaultOptions.width}&height=${defaultOptions.height}&model=${defaultOptions.model}&nologo=true`,
        prompt,
        width: defaultOptions.width!,
        height: defaultOptions.height!
      });
    }
  }

  return results;
}

export function generateImagePrompts(
  keyword: string,
  title: string,
  contentSections: any[]
): string[] {
  const prompts: string[] = [];

  // Main hero image prompt
  prompts.push(
    `Professional hero image for blog post about ${keyword}, modern design, high quality, clean composition, suitable for article header, photorealistic style`
  );

  // Secondary supportive image prompt
  const sectionTopics = contentSections?.slice(0, 2).map(section => 
    section.heading?.toLowerCase().replace(/[^\w\s]/gi, '') || keyword
  ) || [keyword];

  prompts.push(
    `Infographic style illustration about ${sectionTopics[0] || keyword}, clean modern design, informative, professional, suitable for blog content`
  );

  return prompts;
}