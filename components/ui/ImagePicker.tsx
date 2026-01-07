// components/business/ImagePicker.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePickerNative from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

interface ImagePickerProps {
    label: string;
    currentImage?: string;
    bucket: 'business-logos' | 'business-covers';
    businessId: string;
    aspectRatio?: [number, number];
    onImageUploaded: (url: string) => void;
}

export default function ImagePicker({
                                        label,
                                        currentImage,
                                        bucket,
                                        businessId,
                                        aspectRatio = [1, 1],
                                        onImageUploaded
                                    }: ImagePickerProps) {
    const [uploading, setUploading] = useState(false);
    const [localUri, setLocalUri] = useState<string | undefined>(currentImage);

    const pickImage = async () => {
        try {
            // Solicitar permisos
            const { status } = await ImagePickerNative.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para subir imágenes.');
                return;
            }

            // Abrir selector de imágenes
            const result = await ImagePickerNative.launchImageLibraryAsync({
                mediaTypes: ImagePickerNative.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: aspectRatio,
                quality: 0.7, // Reducimos un poco más la calidad
                base64: true, // IMPORTANTE: Necesitamos base64 para React Native
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
            // Validar que tenemos base64
            if (!asset.base64) {
                throw new Error('No se pudo obtener los datos de la imagen');
            }

            // Generar nombre único
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${businessId}_${Date.now()}.${fileExt}`;
            const filePath = fileName;

            // Determinar el tipo MIME
            const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

            console.log('Subiendo imagen:', { bucket, filePath, mimeType });

            // Convertir base64 a ArrayBuffer
            const arrayBuffer = decode(asset.base64);

            // Subir a Supabase usando ArrayBuffer
            const { error: uploadError, data } = await supabase.storage
                .from(bucket)
                .upload(filePath, arrayBuffer, {
                    contentType: mimeType,
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            console.log('Upload exitoso:', data);

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log('URL pública:', publicUrl);

            setLocalUri(publicUrl);
            onImageUploaded(publicUrl);

            Alert.alert('¡Éxito!', 'Imagen subida correctamente');
        } catch (error: any) {
            console.error('Error completo al subir:', error);
            Alert.alert('Error al subir', error.message || 'No se pudo subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                onPress={pickImage}
                disabled={uploading}
                style={styles.imageButton}
                activeOpacity={0.7}
            >
                {localUri ? (
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: localUri }}
                            style={[
                                styles.image,
                                bucket === 'business-logos' ? styles.logoImage : styles.coverImage
                            ]}
                            resizeMode="cover"
                        />
                        {uploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator color="white" size="large" />
                                <Text style={styles.uploadingText}>Subiendo...</Text>
                            </View>
                        )}
                        {!uploading && (
                            <View style={styles.editBadge}>
                                <FontAwesome5 name="camera" size={14} color="white" />
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={[
                        styles.placeholder,
                        bucket === 'business-logos' ? styles.logoPlaceholder : styles.coverPlaceholder
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
                {bucket === 'business-logos'
                    ? 'Logo cuadrado (recomendado 500x500px)'
                    : 'Imagen rectangular (recomendado 1200x600px)'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8
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
        height: 180,
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
        height: 180,
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