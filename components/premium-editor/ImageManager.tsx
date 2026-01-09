// components/premium-editor/ImageManager.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePickerNative from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

interface ImageManagerProps {
    label: string;
    currentImage?: string;
    bucket: 'business-logos' | 'business-covers' | 'business-backgrounds';
    businessId: string;
    aspectRatio?: [number, number];
    onImageUploaded: (url: string) => void;
    onImageDeleted?: () => void;
}

export default function ImageManager({
                                         label,
                                         currentImage,
                                         bucket,
                                         businessId,
                                         aspectRatio = [1, 1],
                                         onImageUploaded,
                                         onImageDeleted
                                     }: ImageManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [localUri, setLocalUri] = useState<string | undefined>(currentImage);

    // Extraer el nombre del archivo desde la URL pública
    const getFileNameFromUrl = (url: string): string | null => {
        try {
            const parts = url.split('/');
            return parts[parts.length - 1];
        } catch {
            return null;
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePickerNative.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería.');
                return;
            }

            const result = await ImagePickerNative.launchImageLibraryAsync({
                mediaTypes: ImagePickerNative.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: aspectRatio,
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

            // 1. Si existe una imagen anterior, eliminarla primero
            if (localUri) {
                const oldFileName = getFileNameFromUrl(localUri);
                if (oldFileName) {
                    console.log('Eliminando imagen anterior:', oldFileName);
                    const { error: deleteError } = await supabase.storage
                        .from(bucket)
                        .remove([oldFileName]);

                    if (deleteError) {
                        console.warn('No se pudo eliminar la imagen anterior:', deleteError);
                    }
                }
            }

            // 2. Subir la nueva imagen
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${businessId}_${Date.now()}.${fileExt}`;
            const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

            const arrayBuffer = decode(asset.base64);

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, arrayBuffer, {
                    contentType: mimeType,
                    upsert: false // No sobreescribir, crear nuevo
                });

            if (uploadError) throw uploadError;

            // 3. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            setLocalUri(publicUrl);
            onImageUploaded(publicUrl);

            Alert.alert('¡Éxito!', 'Imagen actualizada correctamente');
        } catch (error: any) {
            console.error('Error al subir:', error);
            Alert.alert('Error', error.message || 'No se pudo subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async () => {
        Alert.alert(
            'Eliminar Imagen',
            '¿Estás seguro de que deseas eliminar esta imagen?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            if (localUri) {
                                const fileName = getFileNameFromUrl(localUri);
                                if (fileName) {
                                    const { error } = await supabase.storage
                                        .from(bucket)
                                        .remove([fileName]);

                                    if (error) throw error;
                                }
                            }

                            setLocalUri(undefined);
                            onImageUploaded('');
                            if (onImageDeleted) onImageDeleted();

                            Alert.alert('Eliminado', 'Imagen eliminada correctamente');
                        } catch (error: any) {
                            console.error('Error al eliminar:', error);
                            Alert.alert('Error', 'No se pudo eliminar la imagen');
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {localUri && (
                    <TouchableOpacity
                        onPress={deleteImage}
                        disabled={deleting}
                        style={styles.deleteButton}
                    >
                        {deleting ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                            <>
                                <FontAwesome5 name="trash" size={12} color="#ef4444" />
                                <Text style={styles.deleteButtonText}>Eliminar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                onPress={pickImage}
                disabled={uploading || deleting}
                style={styles.imageButton}
                activeOpacity={0.7}
            >
                {localUri ? (
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: localUri }}
                            style={[
                                styles.image,
                                getImageStyle(bucket)
                            ]}
                            resizeMode="cover"
                        />
                        {uploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator color="white" size="large" />
                                <Text style={styles.uploadingText}>Subiendo...</Text>
                            </View>
                        )}
                        {!uploading && !deleting && (
                            <View style={styles.editBadge}>
                                <FontAwesome5 name="camera" size={14} color="white" />
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={[
                        styles.placeholder,
                        getPlaceholderStyle(bucket)
                    ]}>
                        {uploading ? (
                            <>
                                <ActivityIndicator color="#9ca3af" size="large" />
                                <Text style={styles.uploadingTextDark}>Subiendo...</Text>
                            </>
                        ) : (
                            <>
                                <FontAwesome5 name="image" size={32} color="#9ca3af" />
                                <Text style={styles.placeholderText}>Toca para subir</Text>
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.hint}>
                {getHintText(bucket)}
            </Text>
        </View>
    );
}

// Helpers para estilos según el bucket
const getImageStyle = (bucket: string) => {
    switch (bucket) {
        case 'business-logos':
            return styles.logoImage;
        case 'business-backgrounds':
            return styles.backgroundImage;
        default:
            return styles.coverImage;
    }
};

const getPlaceholderStyle = (bucket: string) => {
    switch (bucket) {
        case 'business-logos':
            return styles.logoPlaceholder;
        case 'business-backgrounds':
            return styles.backgroundPlaceholder;
        default:
            return styles.coverPlaceholder;
    }
};

const getHintText = (bucket: string) => {
    switch (bucket) {
        case 'business-logos':
            return 'Logo cuadrado (recomendado 500x500px)';
        case 'business-backgrounds':
            return 'Imagen vertical (recomendado 1080x1920px)';
        default:
            return 'Imagen rectangular (recomendado 1200x600px)';
    }
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151'
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#fef2f2',
        borderRadius: 8
    },
    deleteButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ef4444'
    },
    imageButton: {
        marginBottom: 8
    },
    imageWrapper: {
        position: 'relative'
    },
    image: {
        backgroundColor: '#f3f4f6'
    },
    logoImage: {
        width: 120,
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb'
    },
    coverImage: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb'
    },
    backgroundImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb'
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16
    },
    uploadingText: {
        color: 'white',
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600'
    },
    uploadingTextDark: {
        color: '#6b7280',
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600'
    },
    editBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#f97316',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4
    },
    placeholder: {
        backgroundColor: '#f9fafb',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 16
    },
    coverPlaceholder: {
        width: '100%',
        height: 160,
        borderRadius: 16
    },
    backgroundPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 16
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500'
    },
    hint: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic'
    }
});