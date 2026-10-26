// Media lives in the public GitHub repo and is served by raw.githubusercontent.com in production,
// which keeps Netlify bandwidth near zero. In dev it is served locally from public/media.
const BASE = (import.meta.env.VITE_MEDIA_BASE as string | undefined) ?? '/media'

export const mediaUrl = (name: string, ext: 'webp' | 'mp4') => `${BASE}/${name}.${ext}`
