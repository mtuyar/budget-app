import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ViewProps, TextStyle, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

interface CardTitleProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...styles.elevated,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          shadowColor: isDark ? '#000000' : '#000000',
        };
      case 'outlined':
        return {
          ...styles.outlined,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderColor: isDark ? '#374151' : '#E5E7EB',
        };
      default:
        return {
          ...styles.default,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        };
    }
  };

  return (
    <View
      style={[styles.base, getVariantStyle(), style]}
      {...props}
    >
      {children}
    </View>
  );
};

export const CardHeader: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

export const CardTitle: React.FC<CardTitleProps> = ({ children, style, ...props }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text
      style={[
        styles.title,
        { color: isDark ? '#FFFFFF' : '#111827' },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const CardContent: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.content, style]} {...props}>
    {children}
  </View>
);

export const CardFooter: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: '#FFFFFF',
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
});