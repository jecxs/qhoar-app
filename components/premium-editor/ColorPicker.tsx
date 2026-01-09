// components/premium-editor/ColorPicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface ColorPickerProps {
    primaryColor: string;
    secondaryColor: string;
    onPrimaryChange: (color: string) => void;
    onSecondaryChange: (color: string) => void;
}

// Paleta de colores predefinidos
const PRESET_COLORS = [
    { name: 'Naranja', primary: '#f97316', secondary: '#fb923c' },
    { name: 'Rojo', primary: '#ef4444', secondary: '#f87171' },
    { name: 'Rosa', primary: '#ec4899', secondary: '#f472b6' },
    { name: 'Púrpura', primary: '#a855f7', secondary: '#c084fc' },
    { name: 'Azul', primary: '#3b82f6', secondary: '#60a5fa' },
    { name: 'Cian', primary: '#06b6d4', secondary: '#22d3ee' },
    { name: 'Verde', primary: '#10b981', secondary: '#34d399' },
    { name: 'Amarillo', primary: '#f59e0b', secondary: '#fbbf24' },
    { name: 'Gris', primary: '#6b7280', secondary: '#9ca3af' },
    { name: 'Negro', primary: '#111827', secondary: '#374151' },
];

export default function ColorPicker({
                                        primaryColor,
                                        secondaryColor,
                                        onPrimaryChange,
                                        onSecondaryChange
                                    }: ColorPickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [editingColor, setEditingColor] = useState<'primary' | 'secondary' | null>(null);
    const [customHex, setCustomHex] = useState('');

    const handlePresetSelect = (preset: typeof PRESET_COLORS[0]) => {
        onPrimaryChange(preset.primary);
        onSecondaryChange(preset.secondary);
        Alert.alert('¡Colores aplicados!', `Paleta ${preset.name} seleccionada`);
    };

    const openCustomColorPicker = (type: 'primary' | 'secondary') => {
        setEditingColor(type);
        setCustomHex(type === 'primary' ? primaryColor : secondaryColor);
        setShowPicker(true);
    };

    const applyCustomColor = () => {
        // Validar formato hex
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(customHex)) {
            Alert.alert('Error', 'El color debe estar en formato hexadecimal (ej: #f97316)');
            return;
        }

        if (editingColor === 'primary') {
            onPrimaryChange(customHex);
        } else if (editingColor === 'secondary') {
            onSecondaryChange(customHex);
        }

        setShowPicker(false);
        setEditingColor(null);
        Alert.alert('¡Aplicado!', 'Color personalizado guardado');
    };

    return (
        <View style={styles.container}>
            {/* Colores Actuales */}
            <View style={styles.currentColors}>
                <TouchableOpacity
                    style={styles.colorBox}
                    onPress={() => openCustomColorPicker('primary')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.colorCircle, { backgroundColor: primaryColor }]}>
                        <FontAwesome5 name="edit" size={14} color="white" />
                    </View>
                    <Text style={styles.colorLabel}>Primario</Text>
                    <Text style={styles.colorHex}>{primaryColor}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.colorBox}
                    onPress={() => openCustomColorPicker('secondary')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.colorCircle, { backgroundColor: secondaryColor }]}>
                        <FontAwesome5 name="edit" size={14} color="white" />
                    </View>
                    <Text style={styles.colorLabel}>Secundario</Text>
                    <Text style={styles.colorHex}>{secondaryColor}</Text>
                </TouchableOpacity>
            </View>

            {/* Paletas Predefinidas */}
            <View style={styles.presetsContainer}>
                <Text style={styles.presetsTitle}>Paletas Predefinidas</Text>
                <View style={styles.presetGrid}>
                    {PRESET_COLORS.map((preset, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.presetItem}
                            onPress={() => handlePresetSelect(preset)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.presetColors}>
                                <View style={[styles.presetColorCircle, { backgroundColor: preset.primary }]} />
                                <View style={[styles.presetColorCircle, { backgroundColor: preset.secondary, marginLeft: -8 }]} />
                            </View>
                            <Text style={styles.presetName}>{preset.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Modal para Color Personalizado */}
            <Modal
                visible={showPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Color {editingColor === 'primary' ? 'Primario' : 'Secundario'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <FontAwesome5 name="times" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.customColorPreview}>
                            <View style={[styles.previewCircle, { backgroundColor: customHex || '#cccccc' }]} />
                        </View>

                        <View style={styles.hexInputContainer}>
                            <Text style={styles.hexLabel}>Código Hexadecimal</Text>
                            <TextInput
                                style={styles.hexInput}
                                value={customHex}
                                onChangeText={setCustomHex}
                                placeholder="#f97316"
                                placeholderTextColor="#9ca3af"
                                autoCapitalize="none"
                                maxLength={7}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowPicker(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={applyCustomColor}
                            >
                                <Text style={styles.applyButtonText}>Aplicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16
    },
    currentColors: {
        flexDirection: 'row',
        gap: 12
    },
    colorBox: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    colorCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3
    },
    colorLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 2
    },
    colorHex: {
        fontSize: 11,
        color: '#9ca3af',
        fontFamily: 'monospace'
    },
    presetsContainer: {
        marginTop: 8
    },
    presetsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12
    },
    presetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    presetItem: {
        width: '18%',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    presetColors: {
        flexDirection: 'row',
        marginBottom: 6
    },
    presetColorCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white'
    },
    presetName: {
        fontSize: 9,
        color: '#6b7280',
        textAlign: 'center'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827'
    },
    customColorPreview: {
        alignItems: 'center',
        marginBottom: 24
    },
    previewCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    hexInputContainer: {
        marginBottom: 24
    },
    hexLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8
    },
    hexInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        fontFamily: 'monospace',
        color: '#111827'
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center'
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6b7280'
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center'
    },
    applyButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white'
    }
});