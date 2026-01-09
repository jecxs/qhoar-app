// components/premium-editor/LayoutSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface LayoutSelectorProps {
    selected: 'classic' | 'modern' | 'visual';
    onSelect: (variant: 'classic' | 'modern' | 'visual') => void;
}

const LAYOUTS = [
    {
        id: 'classic' as const,
        name: 'Clásico',
        description: 'Profesional y estructurado',
        icon: 'list',
        features: ['Header con logo', 'Secciones organizadas', 'Fácil navegación']
    },
    {
        id: 'modern' as const,
        name: 'Moderno',
        description: 'Elegante y minimalista',
        icon: 'th-large',
        features: ['Diseño asimétrico', 'Tipografía espaciada', 'Look editorial']
    },
    {
        id: 'visual' as const,
        name: 'Visual',
        description: 'Inmersivo y dramático',
        icon: 'image',
        features: ['Fondo completo', 'Efectos glassmorphism', 'Máximo impacto']
    }
];

export default function LayoutSelector({ selected, onSelect }: LayoutSelectorProps) {
    return (
        <View style={styles.container}>
            {LAYOUTS.map((layout) => (
                <TouchableOpacity
                    key={layout.id}
                    style={[
                        styles.layoutCard,
                        selected === layout.id && styles.layoutCardSelected
                    ]}
                    onPress={() => onSelect(layout.id)}
                    activeOpacity={0.7}
                >
                    {/* Checkmark */}
                    {selected === layout.id && (
                        <View style={styles.checkmark}>
                            <FontAwesome5 name="check" size={12} color="white" />
                        </View>
                    )}

                    {/* Icono del Layout */}
                    <View style={[
                        styles.iconContainer,
                        selected === layout.id && styles.iconContainerSelected
                    ]}>
                        <FontAwesome5
                            name={layout.icon}
                            size={24}
                            color={selected === layout.id ? '#f97316' : '#6b7280'}
                        />
                    </View>

                    {/* Información */}
                    <View style={styles.layoutInfo}>
                        <Text style={[
                            styles.layoutName,
                            selected === layout.id && styles.layoutNameSelected
                        ]}>
                            {layout.name}
                        </Text>
                        <Text style={styles.layoutDescription}>
                            {layout.description}
                        </Text>

                        {/* Features */}
                        <View style={styles.featuresList}>
                            {layout.features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <View style={[
                                        styles.featureDot,
                                        selected === layout.id && styles.featureDotSelected
                                    ]} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Preview Mockup */}
                    <View style={styles.previewContainer}>
                        <View style={styles.previewMockup}>
                            {layout.id === 'classic' && <ClassicPreview />}
                            {layout.id === 'modern' && <ModernPreview />}
                            {layout.id === 'visual' && <VisualPreview />}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// Mini previews de cada layout
function ClassicPreview() {
    return (
        <View style={styles.mockup}>
            <View style={[styles.mockupHeader, { height: 30, backgroundColor: '#f97316' }]} />
            <View style={styles.mockupContent}>
                <View style={[styles.mockupBlock, { height: 15, width: '60%' }]} />
                <View style={[styles.mockupBlock, { height: 8, width: '80%' }]} />
                <View style={[styles.mockupBlock, { height: 8, width: '70%' }]} />
            </View>
        </View>
    );
}

function ModernPreview() {
    return (
        <View style={styles.mockup}>
            <View style={[styles.mockupHeader, { height: 35, backgroundColor: '#111827' }]} />
            <View style={styles.mockupContent}>
                <View style={[styles.mockupBlock, { height: 12, width: '50%' }]} />
                <View style={[styles.mockupBlock, { height: 3, width: '30%', backgroundColor: '#f97316' }]} />
                <View style={[styles.mockupBlock, { height: 6, width: '90%', marginTop: 8 }]} />
            </View>
        </View>
    );
}

function VisualPreview() {
    return (
        <View style={[styles.mockup, { backgroundColor: '#1f2937' }]}>
            <View style={[styles.mockupHeader, { height: 40, backgroundColor: 'rgba(249,115,22,0.3)' }]} />
            <View style={[styles.mockupContent, { alignItems: 'center' }]}>
                <View style={[styles.mockupBlock, { height: 10, width: '40%', borderRadius: 10 }]} />
                <View style={[styles.mockupBlock, { height: 6, width: '60%', marginTop: 6 }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12
    },
    layoutCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        position: 'relative'
    },
    layoutCardSelected: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed'
    },
    checkmark: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    iconContainerSelected: {
        backgroundColor: '#fff7ed',
        borderColor: '#fed7aa'
    },
    layoutInfo: {
        marginBottom: 16
    },
    layoutName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4
    },
    layoutNameSelected: {
        color: '#f97316'
    },
    layoutDescription: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 12
    },
    featuresList: {
        gap: 6
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    featureDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#9ca3af'
    },
    featureDotSelected: {
        backgroundColor: '#f97316'
    },
    featureText: {
        fontSize: 12,
        color: '#6b7280'
    },
    previewContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb'
    },
    previewMockup: {
        alignItems: 'center'
    },
    mockup: {
        width: 120,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#d1d5db'
    },
    mockupHeader: {
        width: '100%'
    },
    mockupContent: {
        padding: 8,
        gap: 4
    },
    mockupBlock: {
        backgroundColor: '#d1d5db',
        borderRadius: 2
    }
});