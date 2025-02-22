
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const metadata = JSON.parse(formData.get('metadata')?.toString() || '{}')
    const videoFile = formData.get('video')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let storedUrl: string;
    
    // Handle URL-based video
    if (metadata.originalUrl) {
      // For URL-based videos, we'll store the URL directly
      storedUrl = metadata.originalUrl;
    } 
    // Handle file upload
    else if (videoFile) {
      // Generate a unique filename for uploaded file
      const timestamp = new Date().toISOString()
      const fileName = `${crypto.randomUUID()}-${timestamp}`
      const fileExt = (videoFile as File).name.split('.').pop()
      const filePath = `${fileName}.${fileExt}`

      // Upload video to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) {
        throw new Error(`Failed to upload video: ${storageError.message}`)
      }

      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      storedUrl = publicUrl;
    } else {
      throw new Error('Neither video file nor URL provided')
    }

    // Create video record in database
    const { data: videoData, error: dbError } = await supabase
      .from('videos')
      .insert({
        title: metadata.title || 'Untitled Video',
        description: metadata.description,
        original_language: metadata.originalLanguage,
        target_language: metadata.targetLanguage,
        original_url: metadata.originalUrl || storedUrl,
        stored_url: storedUrl,
        status: 'pending',
        metadata: {
          originalFileName: videoFile ? (videoFile as File).name : undefined,
          contentType: videoFile ? (videoFile as File).type : undefined,
          size: videoFile ? (videoFile as File).size : undefined,
          isUrl: Boolean(metadata.originalUrl),
          ...metadata
        }
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Failed to create video record: ${dbError.message}`)
    }

    return new Response(
      JSON.stringify({
        message: metadata.originalUrl ? 'Video URL processed successfully' : 'Video uploaded successfully',
        video: videoData
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in upload-video function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
