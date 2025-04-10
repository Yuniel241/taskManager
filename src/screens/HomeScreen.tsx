import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Platform, Dimensions } from 'react-native';
import { Button, Card, Text, Title, ActivityIndicator, FAB, useTheme, TextInput } from 'react-native-paper';
import { getUserTasks, deleteTask, toggleTaskCompleted } from '../services/taskService';
import { Task } from '../utils/task';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutRight,
  useSharedValue,
  withSpring 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'todo'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const fabAnimation = useSharedValue(0);

  const loadTasks = async () => {
    try {
      const userTasks = await getUserTasks();
      setTasks(userTasks);
    } catch (err) {
      console.error('Erreur chargement projet :', err);
      showToast('error', 'Erreur de chargement des tâches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTasks);
    fabAnimation.value = withSpring(1, { damping: 10 });
    return unsubscribe;
  }, [navigation]);

  const showToast = (type: 'success' | 'error', text: string) => {
    Toast.show({
      type,
      text1: text,
      position: 'bottom',
    });
  };


  useEffect(() => {
    const scheduleNotification = async () => {
      const now = new Date();
      const overdueTasks = tasks.filter(task => !task.completed && new Date(task.endDate) < now);
  
      if (overdueTasks.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Tâches en retard ⏰",
            body: `Tu as ${overdueTasks.length} tâche(s) à rattraper !`,
          },
          trigger: {
            type: 'daily',
            hour: 9,
            minute: 0,
            repeats: true,
          } as Notifications.DailyTriggerInput,
        });
      }
    };

    scheduleNotification();
  }, [tasks]);
  

  const handleToggleCompleted = async (task: Task) => {
    try {
      await toggleTaskCompleted(task.id!, task.completed);
      loadTasks();
      showToast('success', `Tâche marquée comme ${task.completed ? 'à faire' : 'complétée'}`);
    } catch (err) {
      console.error('Erreur update completed :', err);
      showToast('error', 'Erreur lors de la mise à jour');
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const renderItem = ({ item, index }: { item: Task, index: number }) => {
    const isExpanded = expandedTasks.has(item.id!);
    const description = item.description || '';
    const truncated = description.length > 100 && !isExpanded;
    const isLate = !item.completed && new Date(item.endDate) < new Date();

  
    return (
      <Animated.View 
        entering={SlideInRight.delay(index * 50)} 
        exiting={SlideOutRight}
      >
        <Card style={[
          styles.card, 
          item.completed && styles.completedCard,
          isLate && styles.lateCard,
          { borderLeftWidth: 4, borderLeftColor: item.completed ? '#4CAF50' : colors.primary }
        ]}>
          <Card.Title
            title={item.title}
            titleStyle={[
              styles.cardTitle,
              item.completed && styles.completedText
            ]}
            subtitle={`Du ${new Date(item.startDate).toLocaleDateString()} au ${new Date(item.endDate).toLocaleDateString()}`}
            subtitleStyle={styles.cardSubtitle}
            left={props => (
              <Icon 
                name={item.completed ? "check-circle" : "circle-outline"} 
                size={24} 
                color={item.completed ? '#4CAF50' : colors.primary} 
                style={styles.cardIcon}
              />
            )}
          />
          <Card.Content>
            <Text style={[
              styles.cardDescription,
              item.completed && styles.completedText
            ]}>
              {truncated ? `${description.slice(0, 100)}...` : description}
            </Text>
    
            {description.length > 100 && (
              <Button
                compact
                mode="text"
                onPress={() => toggleExpanded(item.id!)}
                labelStyle={styles.seeMoreButton}
                icon={isExpanded ? "chevron-up" : "chevron-down"}
              >
                {isExpanded ? 'Réduire' : 'Voir plus'}
              </Button>
            )}
          </Card.Content>
    
          <Card.Actions style={styles.actions}>
            <Button 
              mode="contained-tonal" 
              onPress={() => handleToggleCompleted(item)}
              style={styles.actionButton}
              labelStyle={styles.actionButtonLabel}
              icon={item.completed ? "close-circle" : "check-circle"}
            >
              {item.completed ? 'Annuler' : 'Terminer'}
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('EditTask', { task: item })}
              style={styles.actionButton}
              labelStyle={styles.actionButtonLabel}
              icon="pencil"
            >
              Modifier
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                Alert.alert(
                  "Confirmer la suppression",
                  "Êtes-vous sûr de vouloir supprimer cette tâche ?",
                  [
                    {
                      text: "Annuler",
                      style: "cancel",
                    },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteTask(item.id!);
                          loadTasks();
                          showToast('success', 'Tâche supprimée');
                        } catch (err) {
                          showToast('error', 'Erreur lors de la suppression');
                        }
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
              style={[styles.actionButton, { borderColor: colors.error }]}
              labelStyle={[styles.actionButtonLabel, { color: colors.error }]}
              icon="delete"
              textColor={colors.error}
            >
              Supprimer
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];
  
    if (selectedFilter === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (selectedFilter === 'todo') {
      filtered = filtered.filter((t) => !t.completed);
    }
  
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }
  
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Title style={styles.title}>Mes Projets</Title>
          <Button 
            mode="text" 
            onPress={logout}
            textColor={colors.primary}
            icon="logout"
          >
            Déconnexion
          </Button>
        </View>

        <TextInput
          mode="outlined"
          placeholder="Rechercher une tâche..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<TextInput.Icon icon="magnify" color={colors.primary} />}
          style={styles.searchInput}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />

        <View style={styles.filterContainer}>
          <Button 
            mode={selectedFilter === 'all' ? 'contained' : 'outlined'} 
            onPress={() => setSelectedFilter('all')}
            style={styles.filterButton}
            textColor={selectedFilter === 'all' ? 'white' : colors.primary}
            icon="format-list-bulleted"
          >
            Tous
          </Button>
          <Button 
            mode={selectedFilter === 'todo' ? 'contained' : 'outlined'} 
            onPress={() => setSelectedFilter('todo')}
            style={styles.filterButton}
            textColor={selectedFilter === 'todo' ? 'white' : colors.primary}
            icon="clock-outline"
          >
            À faire
          </Button>
          <Button 
            mode={selectedFilter === 'completed' ? 'contained' : 'outlined'} 
            onPress={() => setSelectedFilter('completed')}
            style={styles.filterButton}
            textColor={selectedFilter === 'completed' ? 'white' : colors.primary}
            icon="check-circle-outline"
          >
            Terminés
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={styles.sortButton}
            textColor={colors.primary}
            icon={sortOrder === 'asc' ? "sort-calendar-ascending" : "sort-calendar-descending"}
          >
            Trier
          </Button>
        </View>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-text-outline" size={60} color={colors.primary} />
          <Text style={styles.emptyText}>Aucune tâche pour le moment</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('AddTask')}
            style={styles.emptyButton}
          >
            Créer une tâche
          </Button>
        </View>
      ) : (
        <FlatList
          data={getFilteredAndSortedTasks()}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadTasks();
              }}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        label="Nouvelle tâche"
        onPress={() => navigation.navigate('AddTask')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="white"
        visible={true}
        animated={true}
      />

      <Toast />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    minWidth: 100,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButton: {
    borderRadius: 8,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 2,
  },
  completedCard: {
    backgroundColor: '#f5fdf4',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginTop: 8,
  },
  completedText: {
    color: '#888',
  },
  cardIcon: {
    marginRight: 8,
  },
  seeMoreButton: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonLabel: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 50,
  },
  
  lateCard: {
    backgroundColor: '#ffe6e6', // rouge pâle
    borderLeftColor: '#f44336', // rouge vif
  },
  
});

export default HomeScreen;