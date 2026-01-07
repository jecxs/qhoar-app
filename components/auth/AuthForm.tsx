import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'register';

export default function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [loading, setLoading] = useState(false);

    // Campos
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    async function handleSubmit() {
        if (!email || !password) return Alert.alert('Error', 'Completa los campos');
        if (mode === 'register' && !phone) return Alert.alert('Error', 'El teléfono es obligatorio');

        setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            phone_number: phone
                        }
                    }
                });

                if (error) throw error;

                if (data.session) {
                    Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada.');
                } else {
                    Alert.alert('Verifica tu correo', 'Revisa tu bandeja de entrada.');
                    return;
                }
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Text>

            <View className="mb-4">
                <Text className="text-gray-600 mb-1 font-medium">Correo</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                    placeholder="correo@ejemplo.com"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            <View className="mb-4">
                <Text className="text-gray-600 mb-1 font-medium">Contraseña</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                    placeholder="******"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            {mode === 'register' && (
                <View className="mb-6">
                    <Text className="text-gray-600 mb-1 font-medium">Celular / WhatsApp</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                        placeholder="999 999 999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>
            )}

            <TouchableOpacity
                className="bg-orange-500 p-4 rounded-xl items-center mb-4"
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : (
                    <Text className="text-white font-bold text-lg">{mode === 'login' ? 'Ingresar' : 'Registrarme'}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} className="items-center">
                <Text className="text-gray-500">
                    {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <Text className="text-orange-500 font-bold">{mode === 'login' ? 'Regístrate' : 'Ingresa'}</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}