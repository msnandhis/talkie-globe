
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
    const videoFile = formData.get('video')
    const metadata = JSON.parse(formData.get('metadata')?.toString() || '{}')

    if (!videoFile) {
      throw new Error('No video file uploaded')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a unique filename
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

    // Create video record in database
    const { data: videoData, error: dbError } = await supabase
      .from('videos')
      .insert({
        title: metadata.title || 'Untitled Video',
        description: metadata.description,
        original_language: metadata.originalLanguage,
        target_language: metadata.targetLanguage,
        original_url: publicUrl,
        stored_url: publicUrl,
        status: 'pending',
        metadata: {
          originalFileName: (videoFile as File).name,
          contentType: (videoFile as File).type,
          size: (videoFile as File).size,
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
        message: 'Video uploaded successfully',
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
