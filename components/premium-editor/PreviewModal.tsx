// components/premium-editor/PreviewModal.tsx
import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    ImageBackground
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Business, BusinessImage } from '@/constants/types/business';
import { supabase } from '@/lib/supabase';

// Importar los layouts
import StandardLayout from '@/components/business-layouts/StandardLayout';
import ModernLayout from '@/components/business-layouts/ModernLayout';
import VisualLayout from '@/components/business-layouts/VisualLayout';

interface PreviewModalProps {
    visible: boolean;
    onClose: () => void;
    business: Business;
}

export default function PreviewModal({ visible, onClose, business }: PreviewModalProps) {
    const [gallery, setGallery] = useState<BusinessImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible && business?.id) {
            loadGallery();
        }
    }, [visible, business?.id]);

    const loadGallery = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('business_images')
                .select('*')
                .eq('business_id', business.id)
                .order('order_index');

            if (!error && data) {
                setGallery(data);
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    // Preparar el theme con valores por defecto
    const theme = business.design_config || {
        layout_variant: 'classic',
        primary_color: '#f97316',
        secondary_color: '#374151',
        cover_type: 'image',
        cover_url: '',
        background_url: '',
        background_opacity: 0.05
    };

    const renderLayout = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text style={styles.loadingText}>Cargando previsualización...</Text>
                </View>
            );
        }

        // Seleccionar layout según configuración
        const layoutVariant = theme.layout_variant || 'classic';

        switch (layoutVariant) {
            case 'modern':
                return <ModernLayout business={business} gallery={gallery} theme={theme} />;
            case 'visual':
                return <VisualLayout business={business} gallery={gallery} theme={theme} />;
            case 'classic':
            default:
                return <StandardLayout business={business} gallery={gallery} theme={theme} />;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header del Modal */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <FontAwesome5 name="eye" size={20} color="#f97316" />
                            <Text style={styles.headerTitle}>Previsualización</Text>
                            <View style={styles.layoutBadge}>
                                <Text style={styles.layoutBadgeText}>
                                    {theme.layout_variant === 'classic' && 'Clásico'}
                                    {theme.layout_variant === 'modern' && 'Moderno'}
                                    {theme.layout_variant === 'visual' && 'Visual'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <FontAwesome5 name="times" size={22} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Info banner */}
                    <View style={styles.infoBanner}>
                        <FontAwesome5 name="info-circle" size={14} color="#f97316" />
                        <Text style={styles.infoBannerText}>
                            Esta es una vista previa. Los cambios aún no se han guardado.
                        </Text>
                    </View>
                </View>

                {/* Contenido de la previsualización */}
                <View style={styles.previewContainer}>
                    {theme.background_url && theme.layout_variant !== 'visual' ? (
                        <ImageBackground
                            source={{ uri: theme.background_url }}
                            style={{ flex: 1 }}
                            imageStyle={{ opacity: theme.background_opacity || 0.05 }}
                            resizeMode="cover"
                        >
                            {renderLayout()}
                        </ImageBackground>
                    ) : (
                        renderLayout()
                    )}
                </View>

                {/* Footer con acciones */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeFooterButton}
                    >
                        <Text style={styles.closeFooterButtonText}>Cerrar Vista Previa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingTop: 16,
        paddingBottom: 12
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827'
    },
    layoutBadge: {
        backgroundColor: '#fff7ed',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fed7aa'
    },
    layoutBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#f97316'
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff7ed',
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fed7aa'
    },
    infoBannerText: {
        flex: 1,
        fontSize: 12,
        color: '#92400e',
        lineHeight: 16
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12
    },
    loadingText: {
        fontSize: 14,
        color: '#6b7280'
    },
    footer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 20,
        paddingBottom: 32
    },
    closeFooterButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center'
    },
    closeFooterButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151'
    }
});