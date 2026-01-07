// types/business.ts

// 1. Configuración de Diseño
export interface DesignConfig {
    layout_variant: 'classic' | 'modern' | 'visual';
    primary_color?: string;
    secondary_color?: string;
    cover_type: 'image' | 'video' | 'solid';
    cover_url?: string;
    background_url?: string;
    background_opacity?: number;
}

// 2. Imagen del Carrusel
export interface BusinessImage {
    id: number;
    image_url: string;
    title?: string;
    description?: string;
    order_index: number;
}

// 3. Empresa Completa
export interface Business {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    whatsapp: string;
    website_url?: string;
    latitude?: number;
    longitude?: number;
    logo_url: string;
    hero_image_url: string;
    social_links: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
    };
    is_premium: boolean;
    design_config: DesignConfig | null;
    business_images?: BusinessImage[];
}