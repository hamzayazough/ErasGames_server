import React from 'react';
import {View as RNView, ViewProps as RNViewProps, ViewStyle} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';

interface ViewProps extends RNViewProps {
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  backgroundColor?: keyof ReturnType<typeof useTheme>['colors'];
  borderRadius?: keyof ReturnType<typeof useTheme>['radius'] | number;
  shadow?: keyof ReturnType<typeof useTheme>['shadows'];
  flex?: number;
  center?: boolean;
  row?: boolean;
}

export function View({
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  backgroundColor,
  borderRadius,
  shadow,
  flex,
  center = false,
  row = false,
  style,
  ...props
}: ViewProps) {
  const theme = useTheme();
  
  const getSpacing = (value?: number) => value ? theme.spacing(value) : undefined;
  
  const getBorderRadius = () => {
    if (typeof borderRadius === 'number') return borderRadius;
    if (borderRadius && typeof borderRadius === 'string') {
      return theme.radius[borderRadius];
    }
    return undefined;
  };
  
  const dynamicStyle: ViewStyle = {
    ...(padding !== undefined && {padding: getSpacing(padding)}),
    ...(paddingHorizontal !== undefined && {paddingHorizontal: getSpacing(paddingHorizontal)}),
    ...(paddingVertical !== undefined && {paddingVertical: getSpacing(paddingVertical)}),
    ...(margin !== undefined && {margin: getSpacing(margin)}),
    ...(marginHorizontal !== undefined && {marginHorizontal: getSpacing(marginHorizontal)}),
    ...(marginVertical !== undefined && {marginVertical: getSpacing(marginVertical)}),
    ...(backgroundColor && {backgroundColor: theme.colors[backgroundColor]}),
    ...(borderRadius && {borderRadius: getBorderRadius()}),
    ...(flex !== undefined && {flex}),
    ...(center && {alignItems: 'center', justifyContent: 'center'}),
    ...(row && {flexDirection: 'row'}),
    ...(shadow && theme.shadows[shadow]),
  };
  
  return (
    <RNView style={[dynamicStyle, style]} {...props} />
  );
}

export default View;