import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { TextInput, Button, Title, useTheme, Card, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateTask } from '../services/taskService';
import { Task } from '../utils/task';
import { scheduleTaskNotification, cancelNotification } from '../services/notifications';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../utils/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

type EditTaskRouteProp = RouteProp<RootStackParamList, 'EditTask'>;

const EditTaskScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<EditTaskRouteProp>();
  const task = route.params.task;
  const [scaleValue] = useState(new Animated.Value(0.95));

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [startDate, setStartDate] = useState(new Date(task.startDate));
  const [endDate, setEndDate] = useState(new Date(task.endDate));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  }, []);

  const handleUpdate = async () => {

    setLoading(true);
    try {
      // Annuler toutes les notifications existantes
      if (task.notificationId) {
        const { dayBeforeId, sameDayId, startDayId, sevenDaysAfterId } = task.notificationId;
        
        if (dayBeforeId) await cancelNotification(dayBeforeId);
        if (sameDayId) await cancelNotification(sameDayId);
        if (startDayId) await cancelNotification(startDayId);
        if (sevenDaysAfterId) await cancelNotification(sevenDaysAfterId);
      }
  
      const updatedTask = {
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
  
      await updateTask(task.id!, updatedTask);
  
      // Recréer les notifications avec les nouvelles dates
      const notificationIds = await scheduleTaskNotification(
        task.id!,
        title,
        endDate
      );
  
      // Mettre à jour la tâche avec les nouveaux IDs de notification
      if (notificationIds) {
        await updateTask(task.id!, { notificationId: notificationIds });
      }
  
      Alert.alert('Succès', 'Projet mis à jour');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Mise à jour échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={styles.gradientContainer}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.header}>
                <Icon name="pencil" size={28} color={colors.primary} />
                <Title style={[styles.title, { color: colors.primary }]}>
                  Modifier le projet
                </Title>
              </View>

              <TextInput
                label="Titre"
                value={title}
                onChangeText={setTitle}
                mode="flat"
                style={styles.input}
                underlineColor="transparent"
                theme={{ colors: { primary: colors.primary } }}
                left={<TextInput.Icon icon="format-title" />}
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="flat"
                multiline
                numberOfLines={4}
                style={[styles.input, styles.descriptionInput]}
                underlineColor="transparent"
                theme={{ colors: { primary: colors.primary } }}
                left={<TextInput.Icon icon="text" />}
              />

              <View style={styles.dateContainer}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateLabel}>Date de début</Text>
                  <Button
                    onPress={() => setShowStartPicker(true)}
                    mode="contained-tonal"
                    style={styles.dateButton}
                    icon="calendar-start"
                    labelStyle={{ color: colors.primary }}
                  >
                    {startDate.toLocaleDateString()}
                  </Button>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateLabel}>Date de fin</Text>
                  <Button
                    onPress={() => setShowEndPicker(true)}
                    mode="contained-tonal"
                    style={styles.dateButton}
                    icon="calendar-end"
                    labelStyle={{ color: colors.error }}
                  >
                    {endDate.toLocaleDateString()}
                  </Button>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
              )}

              <Button
                mode="contained"
                onPress={handleUpdate}
                loading={loading}
                disabled={loading}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                labelStyle={{ color: 'white' }}
                contentStyle={{ height: 50 }}
              >
                <Icon name="content-save" size={20} color="white" />
                <Text style={{ marginLeft: 8, color: 'white' }}>
                  Sauvegarder
                </Text>
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    marginLeft: 10,
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  descriptionInput: {
    height: 100,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  dateButton: {
    borderRadius: 8,
    borderWidth: 0,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditTaskScreen;