import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';


const getIconName = (dbName: string) => {
    const map: Record<string, string> = {
        'laptop': 'laptop-code',
        'leaf': 'leaf',
        'paw': 'paw',
        'home': 'building',
        'utensils': 'utensils',
        'hammer': 'hammer',
        'store': 'store',
        'church': 'church'

    };
    return map[dbName] || 'question'; // icono por defecto
};

export const CategoryIcon = ({ name, size = 24, color = 'black' }: { name: string, size?: number, color?: string }) => {
    return <FontAwesome5 name={getIconName(name)} size={size} color={color} />;
};