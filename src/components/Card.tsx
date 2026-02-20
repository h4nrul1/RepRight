import React, {ReactNode, useMemo} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {ThemeColors} from '../styles/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card({children, style}: CardProps) {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
  });
