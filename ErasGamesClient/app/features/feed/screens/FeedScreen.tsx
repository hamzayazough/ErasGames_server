import React from 'react';
import {FlatList, RefreshControl, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Card, Button} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {useFeed} from '../hooks';
import type {Quiz} from '../api';

export default function FeedScreen() {
  const {t} = useTranslation();
  const theme = useTheme();
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();
  
  const quizzes = data?.pages.flatMap(page => page.quizzes) ?? [];
  
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  const renderQuizCard = ({item}: {item: Quiz}) => (
    <Card style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <Text variant="heading3" style={styles.quizTitle}>
          {item.title}
        </Text>
        <View style={[styles.difficultyBadge, {
          backgroundColor: getDifficultyColor(item.difficulty, theme),
        }]}>
          <Text variant="caption" color="onPrimary">
            {item.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text variant="body" color="secondary" style={styles.quizDescription}>
        {item.description}
      </Text>
      
      <View style={styles.quizMeta}>
        <Text variant="caption" color="muted">
          {item.questionsCount} questions • {item.duration}min • {item.category}
        </Text>
        <Text variant="caption" color="muted">
          by {item.authorName}
        </Text>
      </View>
      
      <Button
        title={t('feed.start_quiz')}
        onPress={() => {
          // Navigate to quiz
          console.log('Start quiz:', item.id);
        }}
        style={styles.startButton}
      />
    </Card>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="heading3" align="center" style={styles.emptyTitle}>
        🎯 {t('feed.no_quizzes')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('feed.no_quizzes_description')}
      </Text>
    </View>
  );
  
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text variant="caption" color="secondary">
          {t('common.loading')}...
        </Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text variant="heading2" style={styles.headerTitle}>
          🎮 Daily Quizzes
        </Text>
        <Text variant="body" color="secondary">
          {t('feed.discover_quizzes')}
        </Text>
      </View>
      
      <FlatList
        data={quizzes}
        renderItem={renderQuizCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function getDifficultyColor(difficulty: string, theme: any) {
  switch (difficulty) {
    case 'easy':
      return theme.colors.success;
    case 'medium':
      return theme.colors.warning;
    case 'hard':
      return theme.colors.error;
    default:
      return theme.colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  quizCard: {
    marginBottom: 16,
    padding: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quizTitle: {
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  quizMeta: {
    marginBottom: 16,
  },
  startButton: {
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});