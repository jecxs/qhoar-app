export type EventCategory = 'cultural' | 'social' | 'academico' | 'deportivo' | 'religioso' | 'otro';

export interface Event {
    id: string;
    business_id?: string | null;
    organizer_name?: string | null;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location_text: string;
    poster_url: string;
    is_featured: boolean;
    category: EventCategory;
    created_at: string;
    businesses?: {
        name: string;
        logo_url: string;
    } | null;
}