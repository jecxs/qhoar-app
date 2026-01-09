import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Image,
    StyleSheet,
    BackHandler,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AuthForm from '@/components/auth/AuthForm';
import {FontAwesome5} from "@expo/vector-icons"; // Importa el componente

type BusinessStatus = 'none' | 'pending' | 'active' | 'rejected';

export default function RegisterScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [status, setStatus] = useState<BusinessStatus>('none');
    const [businessData, setBusinessData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const checkStatus = async () => {
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            if (currentSession) {
                const { data: business } = await supabase
                    .from('businesses')
                    .select('id, name, status, is_premium')
                    .eq('owner_id', currentSession.user.id)
                    .maybeSingle();

                if (business) {
                    setStatus(business.status);
                    setBusinessData(business);
                } else {
                    setStatus('none');
                }
            } else {
                setStatus('none');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { checkStatus(); }, []));
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Si puede volver, cerramos el Tab (dismiss) para ver el Home
                if (router.canGoBack()) {
                    router.dismiss();
                    return true; // Bloqueamos el comportamiento por defecto
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#f97316" /></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, padding: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); checkStatus(); }} />}
            >
                {/* 1. NO LOGUEADO */}
                {!session && (
                    <View className="flex-1 justify-center">
                        <View className="items-center mb-8">
                            <Text className="text-3xl font-bold text-gray-900 mb-2">Únete a Qhoar</Text>
                            <Text className="text-gray-500 text-center">Registra tu negocio y conecta con Ayacucho.</Text>
                        </View>
                        <AuthForm onSuccess={checkStatus} />
                    </View>
                )}

                {/* 2. LOGUEADO SIN NEGOCIO */}
                {session && status === 'none' && (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-2xl font-bold text-gray-800 mb-4">¡Bienvenido!</Text>
                        <Text className="text-gray-600 text-center mb-8 px-4">
                            Ya eres parte de la comunidad. Ahora da el siguiente paso registrando tu empresa.
                        </Text>
                        <TouchableOpacity
                            className="bg-orange-500 px-8 py-4 rounded-full w-full shadow-md active:bg-orange-600"
                            onPress={() => router.push('/(tabs)/register/form')}
                        >
                            <Text className="text-white text-center font-bold text-lg">Iniciar Inscripción</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => supabase.auth.signOut().then(checkStatus)} className="mt-8">
                            <Text className="text-red-400">Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 3. PENDIENTE */}
                {session && status === 'pending' && (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-4xl mb-4">⏳</Text>
                        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">Solicitud en Revisión</Text>
                        <Text className="text-gray-600 text-center mb-6">
                            Estamos verificando los datos de <Text className="font-bold">{businessData?.name}</Text>. Te contactaremos pronto.
                        </Text>
                        <TouchableOpacity onPress={() => supabase.auth.signOut().then(checkStatus)} className="mt-4">
                            <Text className="text-red-400">Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 4. ACTIVO */}
                {session && status === 'active' && (
                    <View style={styles.centeredContent}>
                        <Text style={styles.emoji}>
                            <FontAwesome5 name="check-circle" size={48} color="#f97316" />
                        </Text>
                        <Text style={styles.statusTitle}>¡Tu negocio está visible!</Text>
                        <Text style={styles.statusText}>
                            {businessData?.is_premium
                                ? 'Tu suscripción Premium te permite destacar sobre la competencia.'
                                : 'Completa tu perfil con imágenes y redes sociales para destacar más.'}
                        </Text>

                        {/* Botones de acción (APP) */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.viewProfileButton}
                                onPress={() => router.push(`/(tabs)/explore/list/detail/${businessData?.id}`)}
                            >
                                <FontAwesome5 name="eye" size={16} color="white" />
                                <Text style={styles.viewProfileText}>Ver Perfil Público</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.manageButton}
                                onPress={() => {
                                    if (businessData?.is_premium) {
                                        router.push('/(tabs)/register/manage-premium');
                                    } else {
                                        router.push('/(tabs)/register/manage');
                                    }
                                }}
                            >
                                <FontAwesome5
                                    name={businessData?.is_premium ? "magic" : "edit"}
                                    size={16}
                                    color="#f97316"
                                />
                                <Text style={styles.manageButtonText}>
                                    {businessData?.is_premium ? 'Editor App' : 'Editar Perfil'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* SECCIÓN CONDICIONAL PREMIUM */}
                        {businessData?.is_premium ? (
                            <View style={styles.premiumContainer}>
                                {/* Badge de Estado */}
                                <View style={styles.premiumBadge}>
                                    <FontAwesome5 name="crown" size={16} color="#b45309" />
                                    <Text style={styles.premiumBadgeText}>
                                        Plan Premium Activo
                                    </Text>
                                </View>

                                {/* NUEVA SECCIÓN: Link a la Web */}
                                <View style={styles.webLinkCard}>
                                    <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
                                        <FontAwesome5 name="laptop" size={18} color="#374151" />
                                        <Text style={styles.webLinkTitle}>Gestión Web</Text>
                                    </View>

                                    <Text style={styles.webLinkDesc}>
                                        ¿Prefieres usar tu PC? También puedes editar tu perfil desde nuestra web:
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.urlButton}
                                        // REEMPLAZA ESTA URL CON LA TUYA REAL DE VERCEL/HOSTING
                                        onPress={() => Linking.openURL('https://admin.qhoar.com')}
                                    >
                                        <Text style={styles.urlText}>admin.qhoar.com</Text>
                                        <FontAwesome5 name="external-link-alt" size={14} color="#f97316" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // Versión Freemium (Mantiene el diseño original)
                            <View style={styles.freemiumCard}>
                                <FontAwesome5 name="crown" size={20} color="#f59e0b" />
                                <Text style={styles.freemiumText}>
                                    ¿Quieres más personalización? Actualiza a Premium en nuestra web.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={() => supabase.auth.signOut().then(checkStatus)}
                            style={styles.logoutButton}
                        >
                            <Text style={styles.logoutText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
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
    scrollContent: {
        flexGrow: 1,
        padding: 24
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    authHeader: {
        alignItems: 'center',
        marginBottom: 32
    },
    authTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8
    },
    authSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center'
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16
    },
    welcomeText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16
    },
    startButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 9999,
        width: '100%',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    startButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center'
    },
    statusText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 16
    },
    businessName: {
        fontWeight: 'bold',
        color: '#111827'
    },
    actionButtons: {
        width: '100%',
        gap: 12,
        marginBottom: 16
    },
    viewProfileButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    viewProfileText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8
    },
    manageButton: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#f97316',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    manageButtonText: {
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8
    },
    premiumCard: {
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24
    },
    premiumText: {
        flex: 1,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18
    },
    logoutButton: {
        marginTop: 32
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 14
    },
    premiumContainer: {
        width: '100%',
        marginTop: 10,
        gap: 12
    },
    premiumBadge: {
        backgroundColor: '#fffbeb', // Ambar muy claro
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fde68a',
        gap: 8,
        alignSelf: 'center'
    },
    premiumBadgeText: {
        color: '#b45309',
        fontWeight: 'bold',
        fontSize: 14
    },
    webLinkCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    webLinkTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 8
    },
    webLinkDesc: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
        lineHeight: 20
    },
    urlButton: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    urlText: {
        color: '#f97316', // Color naranja de tu marca
        fontWeight: 'bold',
        fontSize: 14
    },
    // Estilos para Freemium (reemplaza o ajusta los existentes)
    freemiumCard: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        marginTop: 16
    },
    freemiumText: {
        flex: 1,
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 18
    },
});