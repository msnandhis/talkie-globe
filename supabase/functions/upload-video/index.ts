
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { download } from 'https://deno.land/x/download@v2.0.2/mod.ts'
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { basename } from "https://deno.land/std@0.204.0/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const metadata = JSON.parse(formData.get('metadata')?.toString() || '{}')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let storedUrl: string;
    let title = metadata.title;

    // Handle YouTube URL
    if (metadata.originalUrl && metadata.originalUrl.includes('youtube.com')) {
      console.log('Processing YouTube URL:', metadata.originalUrl);
      
      // Extract video ID from URL
      const videoId = new URL(metadata.originalUrl).searchParams.get('v');
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Fetch video info using yt-dlp
      const ytDlpProcess = new Deno.Command('yt-dlp', {
        args: [
          '--format', 'best',
          '--get-url',
          '--get-title',
          metadata.originalUrl
        ]
      });

      const { stdout } = await ytDlpProcess.output();
      const output = new TextDecoder().decode(stdout).split('\n');
      
      if (output.length < 2) {
        throw new Error('Failed to fetch YouTube video info');
      }

      // First line is title, second line is direct video URL
      title = output[0].trim();
      storedUrl = output[1].trim();
      console.log('Got YouTube video:', { title, url: storedUrl });

    } else if (formData.get('video')) {
      // Handle direct file upload
      const file = formData.get('video') as File
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      storedUrl = publicUrl
    } else {
      throw new Error('No video file or URL provided')
    }

    // Create video record in database
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        title,
        stored_url: storedUrl,
        original_url: metadata.originalUrl || null,
        original_language: metadata.originalLanguage || 'auto',
        target_language: metadata.targetLanguage || null,
        status: 'pending',
        metadata
      })
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({
        message: metadata.originalUrl ? 'Video URL processed successfully' : 'Video uploaded successfully',
        video
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
