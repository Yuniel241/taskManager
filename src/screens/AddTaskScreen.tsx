import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask } from '../services/taskService';
import { useNavigation } from '@react-navigation/native';
import { requestNotificationPermissions, scheduleTaskNotification } from '../services/notifications';

const AddTaskScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Erreur', 'La date de fin ne peut pas être avant la date de début');
      return;
    }

    setLoading(true);
    try {
      await requestNotificationPermissions();

      const taskData = {
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: new Date().toISOString(),
        completed: false,
      };

      // Création de la tâche
      const newTaskRef = await addTask(taskData);

      // Programmation de la notification
      const notificationId = await scheduleTaskNotification(newTaskRef.id, title, endDate);

      // Mise à jour de la tâche avec le notificationId
      if (notificationId) {
        await newTaskRef.update({ notificationId });
      }

      Alert.alert('Succès', 'Tâche ajoutée avec notification');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d’ajouter la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={[styles.title, { color: colors.primary }]}>Ajouter une tâche</Title>

      <TextInput
        label="Titre"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Button onPress={() => setShowStartPicker(true)} mode="outlined" style={styles.dateButton}>
        Début : {startDate.toLocaleDateString()}
      </Button>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      <Button onPress={() => setShowEndPicker(true)} mode="outlined" style={styles.dateButton}>
        Fin : {endDate.toLocaleDateString()}
      </Button>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      <Button
        mode="contained"
        onPress={handleAddTask}
        loading={loading}
        disabled={loading}
        style={styles.addButton}
      >
        Ajouter la tâche
      </Button>
    </ScrollView>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
