// app/(tabs)/register/manage-premium.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, StyleSheet, Platform, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { Business, DesignConfig } from '@/constants/types/business';

// Componentes que crearemos después
import ImageManager from '@/components/premium-editor/ImageManager';
import ColorPicker from '@/components/premium-editor/ColorPicker';
import LayoutSelector from '@/components/premium-editor/LayoutSelector';
import GalleryManager from '@/components/premium-editor/GalleryManager';
import PreviewModal from "@/components/premium-editor/PreviewModal";
import ImagePicker from "@/components/ui/ImagePicker";
import {SocialLink} from "@/constants/socials";
import SocialsEditor from "@/components/business/SocialsEditor";

type TabType = 'basic' | 'design' | 'gallery' | 'preview';

export default function ManagePremiumScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [showPreview, setShowPreview] = useState(false);

    const [business, setBusiness] = useState<Business | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    // Estados del formulario básico
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        whatsapp: '',
        logo_url: '',
        hero_image_url: '',
        website_url: ''
    });

    // Estados de diseño premium
    const [designConfig, setDesignConfig] = useState<DesignConfig>({
        layout_variant: 'classic',
        primary_color: '#f97316',
        secondary_color: '#374151',
        cover_type: 'image',
        cover_url: '',
        background_url: '',
        background_opacity: 0.05
    });

    useEffect(() => {
        loadBusinessData();
    }, []);

    const loadBusinessData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'No hay sesión activa');
                router.back();
                return;
            }

            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (error) throw error;

            if (!data.is_premium) {
                Alert.alert(
                    'Acceso Denegado',
                    'Esta función es exclusiva para cuentas Premium. Actualiza tu plan desde nuestra web.',
                    [{ text: 'Entendido', onPress: () => router.back() }]
                );
                return;
            }

            setBusiness(data);
            let links: SocialLink[] = [];
            if (Array.isArray(data.social_links)) {
                links = data.social_links;
            } else if (data.social_links) {
                // Migración automática de datos viejos
                if (data.social_links.facebook) links.push({ platform: 'facebook', url: data.social_links.facebook });
                if (data.social_links.instagram) links.push({ platform: 'instagram', url: data.social_links.instagram });
                if (data.social_links.tiktok) links.push({ platform: 'tiktok', url: data.social_links.tiktok });
            }
            setSocialLinks(links);

            // Cargar datos básicos
            setFormData({
                name: data.name || '',
                description: data.description || '',
                address: data.address || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                logo_url: data.logo_url || '',
                hero_image_url: data.hero_image_url || '',
                website_url: data.website_url || ''
            });

            // Cargar configuración de diseño
            if (data.design_config) {
                setDesignConfig({
                    layout_variant: data.design_config.layout_variant || 'classic',
                    primary_color: data.design_config.primary_color || '#f97316',
                    secondary_color: data.design_config.secondary_color || '#374151',
                    cover_type: data.design_config.cover_type || 'image',
                    cover_url: data.design_config.cover_url || '',
                    background_url: data.design_config.background_url || '',
                    background_opacity: data.design_config.background_opacity ?? 0.05
                });
            }

        } catch (error: any) {
            console.error('Error loading business:', error);
            Alert.alert('Error', 'No se pudo cargar los datos del negocio');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Atención', 'El nombre del negocio es obligatorio');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    name: formData.name,
                    description: formData.description,
                    address: formData.address,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    logo_url: formData.logo_url || null,
                    hero_image_url: formData.hero_image_url || null,
                    website_url: formData.website_url || null,
                    social_links: socialLinks,
                    design_config: designConfig
                })
                .eq('id', business?.id);

            if (error) throw error;

            setHasChanges(false);
            Alert.alert(
                '¡Guardado!',
                'Tu perfil premium ha sido actualizado correctamente',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Error saving:', error);
            Alert.alert('Error', 'No se pudo guardar los cambios: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const updateDesignConfig = (field: keyof DesignConfig, value: any) => {
        setDesignConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };
    const updateSocialLinks = (newLinks: SocialLink[]) => {
        setSocialLinks(newLinks);
        setHasChanges(true); // ¡Esto es lo que faltaba!
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    if (!business) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No se encontró información del negocio</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con Badge Premium */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                        <FontAwesome5 name="arrow-left" size={20} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Editor Premium</Text>
                        <View style={styles.premiumBadge}>
                            <FontAwesome5 name="crown" size={10} color="#fff" />
                            <Text style={styles.premiumBadgeText}>PRO</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowPreview(true)}
                        style={styles.previewButton}
                    >
                        <FontAwesome5 name="eye" size={18} color="#f97316" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs de Navegación */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                >
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'basic' && styles.tabActive]}
                        onPress={() => setActiveTab('basic')}
                    >
                        <FontAwesome5
                            name="info-circle"
                            size={16}
                            color={activeTab === 'basic' ? '#f97316' : '#9ca3af'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'basic' && styles.tabTextActive
                        ]}>
                            Básico
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'design' && styles.tabActive]}
                        onPress={() => setActiveTab('design')}
                    >
                        <FontAwesome5
                            name="palette"
                            size={16}
                            color={activeTab === 'design' ? '#f97316' : '#9ca3af'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'design' && styles.tabTextActive
                        ]}>
                            Diseño
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'gallery' && styles.tabActive]}
                        onPress={() => setActiveTab('gallery')}
                    >
                        <FontAwesome5
                            name="images"
                            size={16}
                            color={activeTab === 'gallery' ? '#f97316' : '#9ca3af'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'gallery' && styles.tabTextActive
                        ]}>
                            Galería
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Contenido según tab activo */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'basic' && (
                    <BasicInfoTab
                        formData={formData}
                        updateFormData={updateFormData}
                        businessId={business.id}
                        socialLinks={socialLinks}
                        setSocialLinks={updateSocialLinks}
                    />
                )}

                {activeTab === 'design' && (
                    <DesignTab
                        designConfig={designConfig}
                        updateDesignConfig={updateDesignConfig}
                        businessId={business.id}
                    />
                )}

                {activeTab === 'gallery' && (
                    <GalleryTab
                        businessId={business.id}
                    />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Botón Guardar Flotante */}
            {hasChanges && (
                <View style={styles.saveButtonContainer}>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        style={styles.saveButton}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <FontAwesome5 name="save" size={18} color="white" />
                                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal de Previsualización */}
            <PreviewModal
                visible={showPreview}
                onClose={() => setShowPreview(false)}
                business={{
                    ...business,
                    ...formData,
                    social_links: socialLinks,
                    design_config: designConfig
                }}
            />
        </View>
    );
}

// ================== TAB: INFORMACIÓN BÁSICA ==================
function BasicInfoTab({ formData, updateFormData, businessId, socialLinks, setSocialLinks }: any) {
    return (
        <View style={styles.tabContent}>
            {/* Imágenes Principales */}
            <Text style={styles.sectionTitle}>Imágenes Principales</Text>

            <ImagePicker
                label="Logo"
                currentImage={formData.logo_url}
                bucket="business-logos"
                businessId={businessId}
                aspectRatio={[1, 1]}
                onImageUploaded={(url) => updateFormData('logo_url', url)}
            />

            <ImagePicker
                label="Imagen Destacada"
                currentImage={formData.hero_image_url}
                bucket="business-covers"
                businessId={businessId}
                aspectRatio={[16, 9]}
                onImageUploaded={(url) => updateFormData('hero_image_url', url)}
            />

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Información del Negocio</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => updateFormData('name', text)}
                    placeholder="Nombre de tu negocio"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => updateFormData('description', text)}
                    placeholder="Describe tu negocio..."
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                    style={styles.input}
                    value={formData.address}
                    onChangeText={(text) => updateFormData('address', text)}
                    placeholder="Av. Principal 123"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>WhatsApp</Text>
                <TextInput
                    style={styles.input}
                    value={formData.whatsapp}
                    onChangeText={(text) => updateFormData('whatsapp', text)}
                    placeholder="999123456"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono Fijo</Text>
                <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => updateFormData('phone', text)}
                    placeholder="(066) 312345"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Sitio Web</Text>
                <TextInput
                    style={styles.input}
                    value={formData.website_url}
                    onChangeText={(text) => updateFormData('website_url', text)}
                    placeholder="https://tuweb.com"
                    autoCapitalize="none"
                    keyboardType="url"
                />
            </View>

            {/* Redes Sociales - CORREGIDO */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Redes Sociales</Text>

            <View style={styles.inputGroup}>
                <SocialsEditor
                    links={socialLinks}
                    onChange={setSocialLinks}
                    isPremium={true}
                />
            </View>
        </View>
    );
}

// ================== TAB: DISEÑO ==================
function DesignTab({ designConfig, updateDesignConfig, businessId }: any) {
    return (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Personalización Visual</Text>
            <Text style={styles.sectionSubtitle}>
                Define la apariencia de tu perfil
            </Text>

            {/* Selector de Layout */}
            <View style={styles.designSection}>
                <Text style={styles.designLabel}>
                    <FontAwesome5 name="th-large" size={14} color="#f97316" /> Tipo de Layout
                </Text>
                <LayoutSelector
                    selected={designConfig.layout_variant}
                    onSelect={(variant) => updateDesignConfig('layout_variant', variant)}
                />
            </View>

            {/* Paleta de Colores */}
            <View style={styles.designSection}>
                <Text style={styles.designLabel}>
                    <FontAwesome5 name="palette" size={14} color="#f97316" /> Colores
                </Text>
                <ColorPicker
                    primaryColor={designConfig.primary_color}
                    secondaryColor={designConfig.secondary_color}
                    onPrimaryChange={(color) => updateDesignConfig('primary_color', color)}
                    onSecondaryChange={(color) => updateDesignConfig('secondary_color', color)}
                />
            </View>

            {/* Cover (Portada) */}
            <View style={styles.designSection}>
                <Text style={styles.designLabel}>
                    <FontAwesome5 name="image" size={14} color="#f97316" /> Portada
                </Text>
                <ImageManager
                    label="Cover"
                    currentImage={designConfig.cover_url}
                    bucket="business-covers"
                    businessId={businessId}
                    aspectRatio={[16, 9]}
                    onImageUploaded={(url) => updateDesignConfig('cover_url', url)}
                />
            </View>

            {/* Fondo */}
            <View style={styles.designSection}>
                <Text style={styles.designLabel}>
                    <FontAwesome5 name="fill" size={14} color="#f97316" /> Imagen de Fondo
                </Text>
                <ImageManager
                    label="Background"
                    currentImage={designConfig.background_url}
                    bucket="business-backgrounds"
                    businessId={businessId}
                    aspectRatio={[9, 16]}
                    onImageUploaded={(url) => updateDesignConfig('background_url', url)}
                />

                {/* Slider de Opacidad */}
                {designConfig.background_url && (
                    <View style={styles.opacityControl}>
                        <Text style={styles.opacityLabel}>
                            Opacidad: {Math.round((designConfig.background_opacity || 0) * 100)}%
                        </Text>
                        {/* Aquí irá un slider real, por ahora botones */}
                        <View style={styles.opacityButtons}>
                            <TouchableOpacity
                                style={styles.opacityButton}
                                onPress={() => updateDesignConfig('background_opacity', 0.05)}
                            >
                                <Text style={styles.opacityButtonText}>5%</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.opacityButton}
                                onPress={() => updateDesignConfig('background_opacity', 0.15)}
                            >
                                <Text style={styles.opacityButtonText}>15%</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.opacityButton}
                                onPress={() => updateDesignConfig('background_opacity', 0.30)}
                            >
                                <Text style={styles.opacityButtonText}>30%</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

// ================== TAB: GALERÍA ==================
function GalleryTab({ businessId }: any) {
    return (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Galería de Imágenes</Text>
            <Text style={styles.sectionSubtitle}>
                Agrega hasta 10 imágenes a tu galería. Arrastra para reordenar.
            </Text>

            <GalleryManager businessId={businessId} />
        </View>
    );
}

// ================== ESTILOS ==================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 16
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8
    },
    backButtonText: {
        color: '#374151',
        fontWeight: '600'
    },
    header: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 24
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerBackButton: {
        marginRight: 16
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginRight: 8
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f59e0b',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4
    },
    premiumBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },
    previewButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff7ed',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabsContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    tabsContent: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 12
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        gap: 8
    },
    tabActive: {
        backgroundColor: '#fff7ed'
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280'
    },
    tabTextActive: {
        color: '#f97316',
        fontWeight: '600'
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        padding: 24
    },
    tabContent: {
        gap: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 16
    },
    inputGroup: {
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#111827'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    socialInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12
    },
    socialIcon: {
        marginRight: 12
    },
    socialInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827'
    },
    designSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16
    },
    designLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12
    },
    opacityControl: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6'
    },
    opacityLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 8
    },
    opacityButtons: {
        flexDirection: 'row',
        gap: 8
    },
    opacityButton: {
        flex: 1,
        paddingVertical: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        alignItems: 'center'
    },
    opacityButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151'
    },
    galleryPlaceholder: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed'
    },
    galleryPlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9ca3af'
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: 80,
        left: 24,
        right: 24
    },
    saveButton: {
        backgroundColor: '#f97316',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8
    }
});