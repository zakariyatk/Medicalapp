// Supabase Edge Function: generate-avatar
//
// Receives a portrait photo (base64) from the app, asks Claude to describe the person's visible
// features, and returns them as cartoon-avatar traits. The photo is never stored.
//
// Deploy:   supabase functions deploy generate-avatar
// Secret:   supabase secrets set ANTHROPIC_API_KEY=...
// App env:  EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

import Anthropic from "npm:@anthropic-ai/sdk";
import { zodOutputFormat } from "npm:@anthropic-ai/sdk/helpers/zod";
import { z } from "npm:zod";

const Traits = z.object({
  skin: z.enum(["light", "fair", "medium", "tan", "brown", "dark"]),
  hairColor: z.enum(["black", "darkBrown", "brown", "blonde", "red", "gray", "white"]),
  hairStyle: z.enum(["short", "spiky", "curly", "long", "bun", "pigtails", "bald"]),
  facialHair: z.enum(["none", "stubble", "mustache", "beard"]),
  glasses: z.boolean(),
  ageGroup: z.enum(["child", "adult", "senior"]),
});

const PROMPT = `This photo is of a family member who wants a friendly cartoon avatar for a family health app.
Describe only what is visible, choosing the closest option for each field:
- skin: overall skin tone.
- hairColor and hairStyle: if the head is covered (cap, scarf, turban), pick the style that best matches the visible outline.
- facialHair: "none" unless clearly visible.
- glasses: true only if the person is wearing glasses.
- ageGroup: child (about 12 or younger), adult, or senior (gray hair or clearly older).
If there is no clear face in the photo, still return your best guess for each field.`;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  let image: string, mediaType: string;
  try {
    ({ image, mediaType = "image/jpeg" } = await req.json());
    if (!image) throw new Error("missing image");
  } catch {
    return Response.json({ error: "Send JSON with a base64 'image' field." }, { status: 400, headers: cors });
  }
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) mediaType = "image/jpeg";

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(Traits) },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as "image/jpeg", data: image },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "Could not describe this photo. Try another one." }, { status: 422, headers: cors });
    }
    return Response.json(response.parsed_output, { headers: cors });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Busy right now. Try again in a minute." }, { status: 429, headers: cors });
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `AI service error ${error.status}` }, { status: 502, headers: cors });
    }
    throw error;
  }
});
