import React from 'react';
import {useNotification} from '../../core/context/NotificationContext';
import DailyQuizNotificationModal from './DailyQuizNotificationModal';
import GenericNotificationModal from './GenericNotificationModal';

interface GlobalNotificationHandlerProps {
  onNavigateToQuiz?: (quizId: string) => void;
}

export default function GlobalNotificationHandler({
  onNavigateToQuiz,
}: GlobalNotificationHandlerProps) {
  const {notificationData, isNotificationVisible, hideNotification} =
    useNotification();

  const handlePlayNow = () => {
    hideNotification();
    
    if (notificationData?.type === 'daily_quiz' && notificationData.quizId && onNavigateToQuiz) {
      onNavigateToQuiz(notificationData.quizId);
    } else if (notificationData?.type === 'daily_quiz' && notificationData.quizId) {
      console.log('Would navigate to quiz:', notificationData.quizId);
    }
  };

  const handleLater = () => {
    hideNotification();
    // Maybe store a reminder or just dismiss
  };

  const handleClose = () => {
    hideNotification();
  };

  // Render appropriate modal based on notification type
  if (notificationData?.type === 'daily_quiz') {
    return (
      <DailyQuizNotificationModal
        visible={isNotificationVisible}
        title={notificationData.title}
        message={notificationData.message}
        quizId={notificationData.quizId}
        dropTime={notificationData.dropTime}
        onPlayNow={handlePlayNow}
        onLater={handleLater}
        onClose={handleClose}
      />
    );
  }

  // Handle test notifications with custom modal
  if (notificationData?.type === 'test') {
    return (
      <GenericNotificationModal
        visible={isNotificationVisible}
        title={notificationData.title || '🧪 Test Notification'}
        message={notificationData.message || 'Test notification received!'}
        buttonText="OK"
        onClose={handleClose}
      />
    );
  }

  // Handle generic notifications with custom modal
  if (notificationData?.type === 'generic') {
    return (
      <GenericNotificationModal
        visible={isNotificationVisible}
        title={notificationData.title || 'Notification'}
        message={notificationData.message || 'You have a new notification'}
        buttonText="OK"
        onClose={handleClose}
      />
    );
  }

  return null;
}