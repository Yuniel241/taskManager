import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated, Easing } from 'react-native';
import { TextInput, Button, Title, useTheme, Card, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask } from '../services/taskService';
import { useNavigation } from '@react-navigation/native';
import { requestNotificationPermissions, scheduleTaskNotification } from '../services/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AddTaskScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(0.95));
  const [opacityValue] = useState(new Animated.Value(0));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

      const newTaskRef = await addTask(taskData);
      const notificationId = await scheduleTaskNotification(newTaskRef.id, title, endDate);

      if (notificationId) {
        await newTaskRef.update({ notificationId });
      }

      Alert.alert('Succès', 'Projet ajouté avec notification');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'ajouter le projet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={styles.gradientContainer}
    >
      <Animated.View style={{ opacity: opacityValue, transform: [{ scale: scaleValue }] }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.header}>
                <Icon name="plus-circle" size={28} color={colors.primary} />
                <Title style={[styles.title, { color: colors.primary }]}>Nouveau Projet</Title>
              </View>

              <TextInput
                label="Titre du projet"
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
                onPress={handleAddTask}
                loading={loading}
                disabled={loading}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                labelStyle={{ color: 'white' }}
                contentStyle={{ height: 50 }}
              >
                <Icon name="check" size={20} color="white" />
                <Text style={{ marginLeft: 8, color: 'white' }}>Créer le Projet</Text>
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

export default AddTaskScreen;

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
  addButton: {
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