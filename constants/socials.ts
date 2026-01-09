import { FontAwesome5 } from '@expo/vector-icons';

export interface SocialLink {
    platform: string;
    url: string;
}

// Configuración de plataformas reconocidas
export const SOCIAL_PLATFORMS: Record<string, { icon: string; color: string; label: string }> = {
    facebook: { icon: 'facebook-f', color: '#1877F2', label: 'Facebook' },
    instagram: { icon: 'instagram', color: '#E1306C', label: 'Instagram' },
    tiktok: { icon: 'tiktok', color: '#000000', label: 'TikTok' },
    youtube: { icon: 'youtube', color: '#FF0000', label: 'YouTube' },
    twitter: { icon: 'twitter', color: '#1DA1F2', label: 'Twitter/X' },
    linkedin: { icon: 'linkedin-in', color: '#0A66C2', label: 'LinkedIn' },
    whatsapp: { icon: 'whatsapp', color: '#25D366', label: 'WhatsApp' },
    telegram: { icon: 'telegram-plane', color: '#0088cc', label: 'Telegram' },
    // Genéricos / Otros
    globe: { icon: 'globe', color: '#6b7280', label: 'Web' },
};

// Función para detectar plataforma
export const detectPlatform = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('wa.me')) return 'whatsapp';
    if (lowerUrl.includes('t.me')) return 'telegram';

    return 'globe'; // Por defecto
};