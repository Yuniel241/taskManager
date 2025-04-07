import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';




// Configuration du comportement de la notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleTaskNotification = async (
    taskId: string,
    title: string,
    endDate: Date
  ): Promise<{ dayBeforeId?: string; sameDayId?: string }> => {
    const now = new Date();
    const notifIds: { dayBeforeId?: string; sameDayId?: string } = {};
  
    const dayBefore = new Date(endDate);
    dayBefore.setDate(endDate.getDate() - 1);
  
    const sameDay = new Date(endDate);
    sameDay.setHours(9, 0, 0); // 9h du matin
  
    // 🔔 Notification la veille
    if (dayBefore > now) {
      const dayBeforeId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Tâche à venir demain',
          body: `La tâche "${title}" se termine demain.`,
          data: { taskId },
        },
        trigger: {
            type: 'date',
            date: dayBefore, // Laissez l'objet Date directement
            repeats: false,
          } as Notifications.DateTriggerInput
      });
      notifIds.dayBeforeId = dayBeforeId;
    }
  
    // 🔔 Notification le jour-même
    if (sameDay > now) {
      const sameDayId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Dernier jour pour :',
          body: `La tâche "${title}" se termine aujourd'hui.`,
          data: { taskId },
        },
        trigger: {type:'date', date: sameDay, repeats: false } as Notifications.DateTriggerInput,
      });
      notifIds.sameDayId = sameDayId;
    }
  
    return notifIds;
  };
  
  
  

export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('Échec suppression notif :', err);
  }
};
