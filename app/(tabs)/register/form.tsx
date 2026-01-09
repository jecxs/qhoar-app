import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Platform, KeyboardAvoidingView, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';

type Category = { id: number; name: string; icon_name: string };
type Subcategory = { id: number; category_id: number; name: string };

// Coordenadas iniciales: Plaza de Armas de Ayacucho
const INITIAL_REGION = {
    latitude: -13.1631,
    longitude: -74.2237,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
};

export default function BusinessFormScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // --- ESTADOS DE DATOS ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    // --- ESTADOS DEL FORMULARIO ---
    const [formData, setFormData] = useState({
        name: '',
        ruc: '',
        description: '',
        phone: '',
        whatsapp: '',
        address: '',
        subcategory_id: null as number | null,
        selected_category_id: null as number | null,
        latitude: INITIAL_REGION.latitude,
        longitude: INITIAL_REGION.longitude,
        logo_url: '',
        hero_image_url: ''
    });

    // --- CARGAR CATEGORIAS ---
    useEffect(() => {
        const fetchCats = async () => {
            setLoading(true);
            const { data: cats } = await supabase.from('categories').select('*');
            const { data: subcats } = await supabase.from('subcategories').select('*');

            if (cats) setCategories(cats);
            if (subcats) setSubcategories(subcats);
            setLoading(false);
        };
        fetchCats();
    }, []);

    const onRegionChangeComplete = (region: Region) => {
        setFormData(prev => ({ ...prev, latitude: region.latitude, longitude: region.longitude }));
    };

    // --- SUBMIT FINAL ---
    const handleSubmit = async () => {
        if (!formData.name || !formData.ruc || !formData.subcategory_id) {
            Alert.alert("Faltan datos", "Por favor completa los campos obligatorios.");
            return;
        }
        if (!/^\d{11}$/.test(formData.ruc)) {
            Alert.alert(
                "RUC inválido",
                "El RUC debe contener exactamente 11 dígitos numéricos."
            );
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay sesión activa");

            const { error } = await supabase.from('businesses').insert({
                owner_id: user.id,
                name: formData.name,
                ruc: formData.ruc,
                description: formData.description,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                address: formData.address,
                subcategory_id: formData.subcategory_id,
                latitude: formData.latitude,
                longitude: formData.longitude,
                logo_url: formData.logo_url || null,
                hero_image_url: formData.hero_image_url || null,
                status: 'pending',
                is_premium: false
            });

            if (error) throw error;

            Alert.alert("¡Solicitud Enviada!", "Tu negocio está en revisión.", [
                { text: "Entendido", onPress: () => router.replace('/(tabs)/register') }
            ]);

        } catch (error: any) {
            console.error("Error detallado:", error);
            const errorMessage = error.message || error.error_description || "No se pudo registrar el negocio. Por favor, verifica los datos e inténtalo de nuevo.";

            Alert.alert("Error al registrar", errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;

    // --- RENDER STEP 1: INFORMACIÓN BÁSICA ---
    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Datos Principales</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Negocio *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej. Restaurante Las Flores"
                    value={formData.name}
                    onChangeText={t => setFormData({...formData, name: t})}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>RUC (11 dígitos) *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="20123456789"
                    keyboardType="numeric"
                    maxLength={11}
                    value={formData.ruc}
                    onChangeText={(t) => {
                        const onlyNumbers = t.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, ruc: onlyNumbers });
                    }}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <View style={styles.categoryContainer}>
                    {loading ? <ActivityIndicator /> : categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setFormData({...formData, selected_category_id: cat.id, subcategory_id: null})}
                            style={[
                                styles.categoryButton,
                                formData.selected_category_id === cat.id && styles.categoryButtonSelected
                            ]}
                        >
                            <Text style={[
                                styles.categoryButtonText,
                                formData.selected_category_id === cat.id && styles.categoryButtonTextSelected
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {formData.selected_category_id && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Subcategoría *</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.subcategoryScroll}
                    >
                        {subcategories
                            .filter(sub => sub.category_id === formData.selected_category_id)
                            .map(sub => (
                                <TouchableOpacity
                                    key={sub.id}
                                    onPress={() => setFormData({...formData, subcategory_id: sub.id})}
                                    style={[
                                        styles.subcategoryButton,
                                        formData.subcategory_id === sub.id && styles.subcategoryButtonSelected
                                    ]}
                                >
                                    <Text style={[
                                        styles.subcategoryButtonText,
                                        formData.subcategory_id === sub.id && styles.subcategoryButtonTextSelected
                                    ]}>
                                        {sub.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción Breve</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="¿Qué ofreces? (Máx 200 caracteres)"
                    multiline
                    value={formData.description}
                    onChangeText={t => setFormData({...formData, description: t})}
                    textAlignVertical="top"
                />
            </View>
        </View>
    );

    // --- RENDER STEP 2: UBICACIÓN Y CONTACTO ---
    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Ubicación Exacta</Text>
            <Text style={styles.subtitle}>Mueve el mapa para que el pin rojo apunte a tu local.</Text>

            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    initialRegion={INITIAL_REGION}
                    onRegionChangeComplete={onRegionChangeComplete}
                />
                <View style={styles.markerOverlay}>
                    <FontAwesome5 name="map-marker-alt" size={36} color="#ef4444" style={{ marginBottom: 36 }} />
                </View>
            </View>

            <Text style={styles.coordinates}>
                Lat: {formData.latitude.toFixed(5)} | Lng: {formData.longitude.toFixed(5)}
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección Escrita</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Av. Independencia 123"
                    value={formData.address}
                    onChangeText={t => setFormData({...formData, address: t})}
                />
            </View>

            <View style={styles.phoneRow}>
                <View style={styles.phoneInput}>
                    <Text style={styles.label}>WhatsApp</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="999..."
                        keyboardType="phone-pad"
                        value={formData.whatsapp}
                        onChangeText={t => setFormData({...formData, whatsapp: t})}
                    />
                </View>
                <View style={styles.phoneInput}>
                    <Text style={styles.label}>Teléfono Fijo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="(066)..."
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={t => setFormData({...formData, phone: t})}
                    />
                </View>
            </View>
        </View>
    );
    // --- RENDER STEP 3: TÉRMINOS Y CONDICIONES  ---
    const renderStep3 = () => (
        <View style={styles.formContainer}>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <View style={{ backgroundColor: '#ffedd5', padding: 20, borderRadius: 100, marginBottom: 16 }}>
                    <FontAwesome5 name="file-contract" size={40} color="#f97316" />
                </View>
                <Text style={styles.sectionTitle}>Revisión y Términos</Text>
                <Text style={{ textAlign: 'center', color: '#6b7280' }}>
                    Antes de publicar tu negocio, por favor confirma la siguiente información.
                </Text>
            </View>

            <View style={styles.termsBox}>
                <Text style={styles.termsTitle}>1. Veracidad de la Información</Text>
                <Text style={styles.termsText}>
                    Declaro que soy el propietario o representante legal de <Text style={{fontWeight:'bold'}}>{formData.name}</Text> y que el número de RUC <Text style={{fontWeight:'bold'}}>{formData.ruc}</Text> es correcto y está activo.
                </Text>

                <Text style={styles.termsTitle}>2. Uso de Datos Públicos</Text>
                <Text style={styles.termsText}>
                    Acepto que la dirección, teléfono, ubicación en el mapa e imágenes proporcionadas sean públicas en la plataforma Qhoar para que los clientes puedan contactarme.
                </Text>

                <Text style={styles.termsTitle}>3. Proceso de Verificación</Text>
                <Text style={styles.termsText}>
                    Entiendo que mi solicitud pasará por un proceso de revisión manual por parte de los administradores de Qhoar antes de ser visible en el aplicativo.
                </Text>
            </View>

            <View style={styles.summaryBox}>
                <Text style={styles.label}>Resumen de solicitud:</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                    <FontAwesome5 name="store" size={14} color="#4b5563" />
                    <Text style={{marginLeft: 8, color: '#374151', fontWeight: 'bold'}}>{formData.name}</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                    <FontAwesome5 name="id-card" size={14} color="#4b5563" />
                    <Text style={{marginLeft: 8, color: '#374151'}}>RUC: {formData.ruc}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <FontAwesome5 name="arrow-left" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Paso {step} de 2</Text>
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
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <View style={{ height: TAB_BAR_HEIGHT + 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer con botones */}
            <View style={[styles.footer, { bottom: TAB_BAR_HEIGHT }]}>
                {step > 1 ? (
                    <TouchableOpacity
                        onPress={() => setStep(step - 1)}
                        style={styles.backFooterButton}
                    >
                        <Text style={styles.backFooterButtonText}>Atrás</Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}

                {step < 3 ? (
                    <TouchableOpacity
                        onPress={() => {
                            if (step === 1) {
                                if (!formData.name || !formData.subcategory_id) {
                                    Alert.alert("Atención", "Selecciona una categoría y pon un nombre.");
                                    return;
                                }
                                if (!/^\d{11}$/.test(formData.ruc)) {
                                    Alert.alert("RUC inválido", "Debes ingresar un RUC válido de 11 dígitos.");
                                    return;
                                }
                            }
                            if (step === 2) {
                                if (!formData.address) {
                                    Alert.alert("Atención", "Por favor ingresa una dirección escrita.");
                                    return;
                                }
                            }

                            setStep(step + 1);
                        }}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>Siguiente</Text>
                        <FontAwesome5 name="arrow-right" color="white" size={16} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        style={styles.submitButton}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Aceptar y Finalizar</Text>
                                <FontAwesome5 name="check" color="white" size={16} />
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// Estilos en StyleSheet para evitar conflictos con NativeWind
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    flex1: {
        flex: 1
    },
    header: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 24
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    backButton: {
        marginRight: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24
    },
    scrollContent: {
        paddingTop: 24
    },
    formContainer: {
        gap: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 16
    },
    inputGroup: {
        marginBottom: 16
    },
    label: {
        color: '#4b5563',
        marginLeft: 4,
        marginBottom: 4
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 12,
        borderRadius: 12
    },
    textArea: {
        height: 96,
        textAlignVertical: 'top'
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: '#e5e7eb'
    },
    categoryButtonSelected: {
        backgroundColor: '#f97316',
        borderColor: '#f97316'
    },
    categoryButtonText: {
        color: '#4b5563'
    },
    categoryButtonTextSelected: {
        color: 'white',
        fontWeight: 'bold'
    },
    subcategoryScroll: {
        flexDirection: 'row'
    },
    subcategoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: '#e5e7eb',
        marginRight: 8
    },
    subcategoryButtonSelected: {
        backgroundColor: '#1f2937',
        borderColor: '#1f2937'
    },
    subcategoryButtonText: {
        color: '#4b5563'
    },
    subcategoryButtonTextSelected: {
        color: 'white'
    },
    mapContainer: {
        height: 256,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
        position: 'relative'
    },
    markerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none'
    },
    coordinates: {
        fontSize: 12,
        textAlign: 'center',
        color: '#9ca3af',
        marginBottom: 24
    },
    phoneRow: {
        flexDirection: 'row',
        gap: 16
    },
    phoneInput: {
        flex: 1
    },
    footer: {
        position: 'absolute',
        width: '100%',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    backFooterButton: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12
    },
    backFooterButtonText: {
        color: '#4b5563',
        fontWeight: 'bold'
    },
    nextButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    nextButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8
    },
    submitButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8
    },
    termsBox: {
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 20
    },
    termsTitle: {
        fontWeight: 'bold',
        color: '#1f2937',
        fontSize: 14,
        marginBottom: 4,
        marginTop: 12
    },
    termsText: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 20
    },
    summaryBox: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#f97316'
    }
});