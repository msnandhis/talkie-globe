
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const metadata = formData.get('metadata')
      ? JSON.parse(formData.get('metadata') as string)
      : {}

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ensure storage buckets exist
    await supabase.storage.createBucket('videos', {
      public: true,
      fileSizeLimit: 52428800
    }).catch(() => {
      // Bucket might already exist, continue
      console.log('Videos bucket already exists')
    })

    await supabase.storage.createBucket('translations', {
      public: true,
      fileSizeLimit: 52428800
    }).catch(() => {
      // Bucket might already exist, continue
      console.log('Translations bucket already exists')
    })

    let videoUrl: string | null = null;
    let fileName: string;

    if (formData.has('video')) {
      const file = formData.get('video') as File
      fileName = file.name
      const fileExt = fileName.split('.').pop()
      const filePath = `${crypto.randomUUID()}.${fileExt}`

      console.log('Uploading video file:', filePath)

      // Upload to videos bucket
      const { error: uploadError } = await supabase
        .storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload video: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('videos')
        .getPublicUrl(filePath)

      videoUrl = publicUrl
      console.log('Video uploaded successfully:', videoUrl)
    } else if (metadata.originalUrl) {
      videoUrl = metadata.originalUrl
      fileName = 'video_from_url'
      console.log('Using video URL:', videoUrl)
    } else {
      throw new Error('No video file or URL provided')
    }

    // Insert video record
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        title: metadata.title || fileName,
        original_url: metadata.originalUrl || null,
        stored_url: videoUrl,
        original_language: metadata.originalLanguage || 'auto',
        target_language: metadata.targetLanguage,
        status: 'pending',
        metadata: {
          ...metadata,
          fileType: formData.has('video') ? (formData.get('video') as File).type : 'url'
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({
        message: 'Video uploaded successfully',
        video
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
