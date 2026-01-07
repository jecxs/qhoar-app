// app/(tabs)/register/manage.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import ImagePicker from '@/components/ui/ImagePicker';

interface BusinessData {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    whatsapp: string;
    logo_url: string;
    hero_image_url: string;
    social_links: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
    };
}

export default function ManageProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [business, setBusiness] = useState<BusinessData | null>(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        whatsapp: '',
        logo_url: '',
        hero_image_url: '',
        facebook: '',
        instagram: '',
        tiktok: ''
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

            setBusiness(data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                address: data.address || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                logo_url: data.logo_url || '',
                hero_image_url: data.hero_image_url || '',
                facebook: data.social_links?.facebook || '',
                instagram: data.social_links?.instagram || '',
                tiktok: data.social_links?.tiktok || ''
            });
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
                    social_links: {
                        facebook: formData.facebook || null,
                        instagram: formData.instagram || null,
                        tiktok: formData.tiktok || null
                    }
                })
                .eq('id', business?.id);

            if (error) throw error;

            Alert.alert(
                '¡Guardado!',
                'Tu perfil ha sido actualizado correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Error saving:', error);
            Alert.alert('Error', 'No se pudo guardar los cambios: ' + error.message);
        } finally {
            setSaving(false);
        }
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
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                        <FontAwesome5 name="arrow-left" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gestionar Perfil</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sección de Imágenes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Imágenes del Negocio</Text>

                        <ImagePicker
                            label="Logo"
                            currentImage={formData.logo_url}
                            bucket="business-logos"
                            businessId={business.id}
                            aspectRatio={[1, 1]}
                            onImageUploaded={(url) => setFormData({ ...formData, logo_url: url })}
                        />

                        <ImagePicker
                            label="Imagen Destacada"
                            currentImage={formData.hero_image_url}
                            bucket="business-covers"
                            businessId={business.id}
                            aspectRatio={[16, 9]}
                            onImageUploaded={(url) => setFormData({ ...formData, hero_image_url: url })}
                        />
                    </View>

                    {/* Información Básica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Básica</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre del Negocio *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Nombre de tu negocio"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
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
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder="Av. Principal 123"
                            />
                        </View>
                    </View>

                    {/* Contacto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información de Contacto</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>WhatsApp</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.whatsapp}
                                onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                                placeholder="999123456"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Teléfono Fijo</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="(066) 312345"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Redes Sociales */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Redes Sociales</Text>
                        <Text style={styles.sectionSubtitle}>
                            Ingresa la URL completa de tus perfiles
                        </Text>

                        <View style={styles.inputGroup}>
                            <View style={styles.socialInputContainer}>
                                <FontAwesome5 name="facebook" size={20} color="#1877F2" style={styles.socialIcon} />
                                <TextInput
                                    style={styles.socialInput}
                                    value={formData.facebook}
                                    onChangeText={(text) => setFormData({ ...formData, facebook: text })}
                                    placeholder="https://facebook.com/tunegocio"
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.socialInputContainer}>
                                <FontAwesome5 name="instagram" size={20} color="#E1306C" style={styles.socialIcon} />
                                <TextInput
                                    style={styles.socialInput}
                                    value={formData.instagram}
                                    onChangeText={(text) => setFormData({ ...formData, instagram: text })}
                                    placeholder="https://instagram.com/tunegocio"
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.socialInputContainer}>
                                <FontAwesome5 name="tiktok" size={20} color="#000000" style={styles.socialIcon} />
                                <TextInput
                                    style={styles.socialInput}
                                    value={formData.tiktok}
                                    onChangeText={(text) => setFormData({ ...formData, tiktok: text })}
                                    placeholder="https://tiktok.com/@tunegocio"
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Botón Guardar Flotante */}
            <View style={styles.footer}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    flex1: {
        flex: 1
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        padding: 24
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16
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
        backgroundColor: '#f9fafb',
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
        backgroundColor: '#f9fafb',
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
    footer: {
        padding: 24,
        backgroundColor: 'white',
        borderTopWidth: 1,
        marginBottom: 70,
        borderTopColor: '#e5e7eb'
    },
    saveButton: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8
    }
});