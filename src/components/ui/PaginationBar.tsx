import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/styles/global';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalEntries?: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const PaginationBar = ({
  page,
  totalPages,
  totalEntries,
  onPrevious,
  onNext,
}: PaginationBarProps) => {
  const theme = useTheme();

  if (totalEntries === 0) return null;

  const currentPage = Math.max(1, page);
  const lastPage = Math.max(1, totalPages);
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < lastPage;

  return (
    <View style={styles.container}>
      <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
        {totalEntries !== undefined
          ? `${totalEntries} ${totalEntries === 1 ? 'registro' : 'registros'} · `
          : ''}
        Página {currentPage} de {lastPage}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={onPrevious}
          disabled={!canGoBack}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surfaceVariant,
              opacity: canGoBack ? 1 : 0.35,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Página anterior"
        >
          <ChevronLeft size={18} color={theme.colors.onSurface} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={!canGoForward}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surfaceVariant,
              opacity: canGoForward ? 1 : 0.35,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Próxima página"
        >
          <ChevronRight size={18} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  info: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
