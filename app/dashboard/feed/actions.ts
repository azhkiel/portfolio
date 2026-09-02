'use server'

import { createClient } from '@/lib/supabase/server'
import { getR2Client } from '@/lib/r2'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { revalidatePath } from 'next/cache'

export async function uploadFeedAction(formData: FormData) {
  const supabase = await createClient()

  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const caption = formData.get('caption') as string
  const files = formData.getAll('images') as File[]

  if (!files || files.length === 0) {
    return { error: 'Please upload at least 1 image' }
  }

  if (files.length > 5) {
    return { error: 'Maximum 5 images allowed' }
  }

  const bucketName = process.env.R2_BUCKET_NAME
  const publicDomain = process.env.R2_PUBLIC_DOMAIN

  if (!bucketName || !publicDomain) {
    return { error: 'R2 storage is not configured properly.' }
  }

  // 1. Insert feed record
  const { data: feed, error: feedError } = await supabase
    .from('feeds')
    .insert({ caption })
    .select()
    .single()

  if (feedError) {
    return { error: feedError.message }
  }

  // 2. Upload images and insert feed_images records
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size === 0) continue

    const ext = file.name.split('.').pop()
    const fileName = `feed-${feed.id}-${i}-${Date.now()}.${ext}`
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const r2Client = getR2Client()
      await r2Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }))

      const imageUrl = `https://${publicDomain}/${fileName}`

      await supabase
        .from('feed_images')
        .insert({
          feed_id: feed.id,
          image_url: imageUrl,
          order_index: i
        })
    } catch (e: any) {
      console.error('Error uploading to R2:', e)
      return { error: `Gagal upload ke R2: ${e.message || String(e)}` }
    }
  }

  revalidatePath('/feed')
  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function deleteFeedAction(feedId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { error: 'Unauthorized' }
  }

  // Fetch images to delete from R2
  const { data: images } = await supabase
    .from('feed_images')
    .select('image_url')
    .eq('feed_id', feedId)

  const bucketName = process.env.R2_BUCKET_NAME

  if (images && bucketName) {
    for (const img of images) {
      const fileName = img.image_url.split('/').pop()
      if (fileName) {
        try {
          const r2Client = getR2Client()
          await r2Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
          }))
        } catch (e) {
          console.error('Failed to delete image from R2:', e)
        }
      }
    }
  }

  // Delete from supabase (cascade will delete feed_images)
  const { error } = await supabase.from('feeds').delete().eq('id', feedId)
  if (error) return { error: error.message }

  revalidatePath('/feed')
  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function updateFeedAction(feedId: string, caption: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('feeds')
    .update({ caption })
    .eq('id', feedId)

  if (error) return { error: error.message }

  revalidatePath('/feed')
  revalidatePath('/dashboard/feed')
  return { success: true }
}
