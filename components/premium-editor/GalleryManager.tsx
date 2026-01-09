// components/premium-editor/GalleryManager.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, TextInput, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePickerNative from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { BusinessImage } from '@/constants/types/business';

interface GalleryManagerProps {
    businessId: string;
}

const MAX_IMAGES = 10;

export default function GalleryManager({ businessId }: GalleryManagerProps) {
    const [images, setImages] = useState<BusinessImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingImage, setEditingImage] = useState<BusinessImage | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        loadGallery();
    }, [businessId]);

    const loadGallery = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('business_images')
                .select('*')
                .eq('business_id', businessId)
                .order('order_index');

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error loading gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickAndUploadImage = async () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert('Límite alcanzado', `Solo puedes tener hasta ${MAX_IMAGES} imágenes en tu galería.`);
            return;
        }

        try {
            const { status } = await ImagePickerNative.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería.');
                return;
            }

            const result = await ImagePickerNative.launchImageLibraryAsync({
                mediaTypes: ImagePickerNative.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const uploadImage = async (asset: any) => {
        setUploading(true);
        try {
            if (!asset.base64) {
                throw new Error('No se pudo obtener los datos de la imagen');
            }

            // Generar nombre único
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${businessId}_gallery_${Date.now()}.${fileExt}`;
            const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

            // Subir a Supabase
            const arrayBuffer = decode(asset.base64);
            const { error: uploadError } = await supabase.storage
                .from('business-gallery')
                .upload(fileName, arrayBuffer, {
                    contentType: mimeType,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('business-gallery')
                .getPublicUrl(fileName);

            // Guardar en la base de datos
            const nextOrder = images.length > 0
                ? Math.max(...images.map(img => img.order_index)) + 1
                : 0;

            const { error: dbError } = await supabase
                .from('business_images')
                .insert({
                    business_id: businessId,
                    image_url: publicUrl,
                    order_index: nextOrder
                });

            if (dbError) throw dbError;

            // Recargar galería
            await loadGallery();
            Alert.alert('¡Éxito!', 'Imagen agregada a la galería');
        } catch (error: any) {
            console.error('Error uploading:', error);
            Alert.alert('Error', error.message || 'No se pudo subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (image: BusinessImage) => {
        Alert.alert(
            'Eliminar Imagen',
            '¿Estás seguro de que deseas eliminar esta imagen de la galería?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Extraer nombre del archivo
                            const fileName = image.image_url.split('/').pop();
                            if (fileName) {
                                // Eliminar del storage
                                await supabase.storage
                                    .from('business-gallery')
                                    .remove([fileName]);
                            }

                            // Eliminar de la BD
                            const { error } = await supabase
                                .from('business_images')
                                .delete()
                                .eq('id', image.id);

                            if (error) throw error;

                            await loadGallery();
                            Alert.alert('Eliminado', 'Imagen eliminada correctamente');
                        } catch (error: any) {
                            console.error('Error deleting:', error);
                            Alert.alert('Error', 'No se pudo eliminar la imagen');
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (image: BusinessImage) => {
        setEditingImage(image);
        setEditTitle(image.title || '');
        setEditDescription(image.description || '');
    };

    const saveImageDetails = async () => {
        if (!editingImage) return;

        try {
            const { error } = await supabase
                .from('business_images')
                .update({
                    title: editTitle || null,
                    description: editDescription || null
                })
                .eq('id', editingImage.id);

            if (error) throw error;

            setEditingImage(null);
            await loadGallery();
            Alert.alert('¡Guardado!', 'Detalles actualizados correctamente');
        } catch (error: any) {
            console.error('Error saving details:', error);
            Alert.alert('Error', 'No se pudo guardar los cambios');
        }
    };

    const moveImage = async (imageId: number, direction: 'up' | 'down') => {
        const index = images.findIndex(img => img.id === imageId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= images.length) return;

        try {
            // Intercambiar order_index
            const img1 = images[index];
            const img2 = images[newIndex];

            await supabase
                .from('business_images')
                .update({ order_index: img2.order_index })
                .eq('id', img1.id);

            await supabase
                .from('business_images')
                .update({ order_index: img1.order_index })
                .eq('id', img2.id);

            await loadGallery();
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con contador */}
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    {images.length} de {MAX_IMAGES} imágenes
                </Text>
                <TouchableOpacity
                    onPress={pickAndUploadImage}
                    disabled={uploading || images.length >= MAX_IMAGES}
                    style={[
                        styles.addButton,
                        (uploading || images.length >= MAX_IMAGES) && styles.addButtonDisabled
                    ]}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <FontAwesome5 name="plus" size={14} color="white" />
                            <Text style={styles.addButtonText}>Agregar</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Lista de imágenes */}
            {images.length === 0 ? (
                <View style={styles.emptyState}>
                    <FontAwesome5 name="images" size={48} color="#d1d5db" />
                    <Text style={styles.emptyStateText}>No hay imágenes en la galería</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Agrega hasta {MAX_IMAGES} fotos de tu negocio
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.imagesList} showsVerticalScrollIndicator={false}>
                    {images.map((image, index) => (
                        <View key={image.id} style={styles.imageCard}>
                            <Image source={{ uri: image.image_url }} style={styles.thumbnail} />

                            <View style={styles.imageInfo}>
                                <Text style={styles.imageTitle} numberOfLines={1}>
                                    {image.title || `Imagen ${index + 1}`}
                                </Text>
                                {image.description && (
                                    <Text style={styles.imageDescription} numberOfLines={2}>
                                        {image.description}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.imageActions}>
                                {/* Reordenar */}
                                <View style={styles.reorderButtons}>
                                    <TouchableOpacity
                                        onPress={() => moveImage(image.id, 'up')}
                                        disabled={index === 0}
                                        style={[styles.iconButton, index === 0 && styles.iconButtonDisabled]}
                                    >
                                        <FontAwesome5
                                            name="chevron-up"
                                            size={12}
                                            color={index === 0 ? '#d1d5db' : '#6b7280'}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => moveImage(image.id, 'down')}
                                        disabled={index === images.length - 1}
                                        style={[styles.iconButton, index === images.length - 1 && styles.iconButtonDisabled]}
                                    >
                                        <FontAwesome5
                                            name="chevron-down"
                                            size={12}
                                            color={index === images.length - 1 ? '#d1d5db' : '#6b7280'}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Editar */}
                                <TouchableOpacity
                                    onPress={() => openEditModal(image)}
                                    style={styles.iconButton}
                                >
                                    <FontAwesome5 name="edit" size={14} color="#3b82f6" />
                                </TouchableOpacity>

                                {/* Eliminar */}
                                <TouchableOpacity
                                    onPress={() => deleteImage(image)}
                                    style={styles.iconButton}
                                >
                                    <FontAwesome5 name="trash" size={14} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Modal de edición */}
            {editingImage && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Detalles</Text>
                            <TouchableOpacity onPress={() => setEditingImage(null)}>
                                <FontAwesome5 name="times" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.modalLabel}>Título (opcional)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Ej: Nuestro local principal"
                                maxLength={50}
                            />

                            <Text style={styles.modalLabel}>Descripción (opcional)</Text>
                            <TextInput
                                style={[styles.modalInput, styles.modalTextArea]}
                                value={editDescription}
                                onChangeText={setEditDescription}
                                placeholder="Agrega una descripción..."
                                multiline
                                maxLength={150}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setEditingImage(null)}
                                style={styles.modalCancelButton}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveImageDetails}
                                style={styles.modalSaveButton}
                            >
                                <Text style={styles.modalSaveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280'
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f97316',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10
    },
    addButtonDisabled: {
        backgroundColor: '#d1d5db'
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13
    },
    emptyState: {
        alignItems: 'center',
        padding: 48,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed'
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280'
    },
    emptyStateSubtext: {
        marginTop: 4,
        fontSize: 13,
        color: '#9ca3af'
    },
    imagesList: {
        flex: 1
    },
    imageCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center'
    },
    thumbnail: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f3f4f6'
    },
    imageInfo: {
        flex: 1,
        marginLeft: 12
    },
    imageTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2
    },
    imageDescription: {
        fontSize: 12,
        color: '#6b7280'
    },
    imageActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center'
    },
    reorderButtons: {
        gap: 4
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    iconButtonDisabled: {
        opacity: 0.3
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827'
    },
    modalBody: {
        padding: 20
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8
    },
    modalInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#111827',
        marginBottom: 16
    },
    modalTextArea: {
        height: 80
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6'
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center'
    },
    modalCancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6b7280'
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: '#f97316',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center'
    },
    modalSaveButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white'
    }
});