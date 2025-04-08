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
    endDate: Date,
    startDate?: Date // 👈 optionnel
  ): Promise<{
    dayBeforeId?: string;
    sameDayId?: string;
    startDayId?: string;
    sevenDaysAfterId?: string;
  }> => {
    const now = new Date();
    const notifIds: {
      dayBeforeId?: string;
      sameDayId?: string;
      startDayId?: string;
      sevenDaysAfterId?: string;
    } = {};
  
    // 🔔 1. Notification la veille
    const dayBefore = new Date(endDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
  
    if (dayBefore > now) {
      const dayBeforeId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Tâche à venir demain',
          body: `La tâche "${title}" se termine demain.`,
          data: { taskId },
        },
        trigger: {
          type: 'date',
          date: dayBefore,
          repeats: false,
        } as Notifications.DateTriggerInput,
      });
      notifIds.dayBeforeId = dayBeforeId;
    }
  
    // 🔔 2. Notification le jour même à 9h
    const sameDay = new Date(endDate);
    sameDay.setHours(9, 0, 0);
  
    if (sameDay > now) {
      const sameDayId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Dernier jour pour :',
          body: `La tâche "${title}" se termine aujourd'hui.`,
          data: { taskId },
        },
        trigger: {
          type: 'date',
          date: sameDay,
          repeats: false,
        } as Notifications.DateTriggerInput,
      });
      notifIds.sameDayId = sameDayId;
    }
  
    // 🔔 3. Notification pour le jour de début à 9h
    if (startDate) {
      const startNotif = new Date(startDate);
      startNotif.setHours(9, 0, 0);
  
      if (startNotif > now) {
        const startDayId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚀 Projet qui commence',
            body: `Le projet "${title}" commence aujourd'hui.`,
            data: { taskId },
          },
          trigger: {
            type: 'date',
            date: startNotif,
            repeats: false,
          } as Notifications.DateTriggerInput,
        });
        notifIds.startDayId = startDayId;
      }
    }
  
    // 🔔 4. Notification après 7 jours si la fin n’est pas encore atteinte
    const after7Days = new Date();
    after7Days.setDate(now.getDate() + 7);
    after7Days.setHours(9, 0, 0);
  
    if (after7Days < endDate) {
      const sevenDaysAfterId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📌 Rappel projet',
          body: `7 jours sont passés depuis la création du projet "${title}". Pense à le suivre.`,
          data: { taskId },
        },
        trigger: {
          type: 'date',
          date: after7Days,
          repeats: false,
        } as Notifications.DateTriggerInput,
      });
      notifIds.sevenDaysAfterId = sevenDaysAfterId;
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
