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
    const [fullName, setFullName] = useState('');
    const [dni, setDni] = useState('');
    const [role, setRole] = useState('');

    async function handleSubmit() {
        if (!email || !password) return Alert.alert('Error', 'Completa los campos');

        if (mode === 'register') {
            if (!fullName) return Alert.alert('Faltan datos', 'El nombre es obligatorio');
            if (!role) return Alert.alert('Faltan datos', 'El cargo es obligatorio');
            if (!phone) return Alert.alert('Faltan datos', 'El teléfono es obligatorio');

            const dniRegex = /^\d{8}$/;
            if (!dni || !dniRegex.test(dni)) {
                return Alert.alert('DNI Inválido', 'El DNI debe tener 8 dígitos exactos.');
            }
        }

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
                            full_name: fullName,
                            dni: dni,
                            phone: phone,

                            role: 'owner',
                            job_title: role
                        }
                    }
                });

                if (error) throw error;

                if (data.session) {
                    Alert.alert('¡Bienvenido!', 'Cuenta creada correctamente.');
                } else {
                    Alert.alert('Verifica tu correo', 'Revisa tu bandeja de entrada.');
                    return;
                }
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error); // Para ver el error real en consola si vuelve a pasar
            Alert.alert('Error', error.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    }

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
    };

    return (
        <View className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {mode === 'login' ? 'Iniciar Sesión' : 'Registro de Representante'}
            </Text>

            {/* Campos exclusivos de REGISTRO */}
            {mode === 'register' && (
                <>
                    <View className="mb-4">
                        <Text className="text-gray-600 mb-1 font-medium">Nombres y Apellidos</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                            placeholder="Ej. Juan Pérez"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-600 mb-1 font-medium">DNI</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                                placeholder="8 dígitos"
                                keyboardType="numeric"
                                maxLength={8}
                                value={dni}
                                onChangeText={(text) => setDni(text.replace(/[^0-9]/g, ''))} // Solo permite números
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-600 mb-1 font-medium">Cargo</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                                placeholder="Ej. Gerente"
                                value={role}
                                onChangeText={setRole}
                            />
                        </View>
                    </View>
                </>
            )}

            <View className="mb-4">
                <Text className="text-gray-600 mb-1 font-medium">Correo Electrónico</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                    placeholder="empresa@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
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
                    <Text className="text-gray-600 mb-1 font-medium">Celular de Contacto</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                        placeholder="999 999 999"
                        keyboardType="phone-pad"
                        maxLength={9}
                        value={phone}
                        onChangeText={setPhone}
                    />
                    <Text className="text-xs text-gray-400 mt-1">
                        Usaremos este número como contacto en caso sea necesario.
                    </Text>
                </View>
            )}

            <TouchableOpacity
                className="bg-orange-500 p-4 rounded-xl items-center mb-4 shadow-orange-200 shadow-lg"
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : (
                    <Text className="text-white font-bold text-lg">
                        {mode === 'login' ? 'Ingresar' : 'Registrar Empresa'}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMode} className="items-center py-2">
                <Text className="text-gray-500">
                    {mode === 'login' ? '¿Quieres registrar tu empresa? ' : '¿Ya tienes cuenta? '}
                    <Text className="text-orange-500 font-bold">{mode === 'login' ? 'Regístrate' : 'Ingresa'}</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}
