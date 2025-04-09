import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  SafeAreaView, 
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import auth, { sendEmailVerification } from '@react-native-firebase/auth';

const VerifyEmailScreen: React.FC = () => {
  const { isEmailVerified, logout, reloadUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const verificationInterval = setInterval(async () => {
      setChecking(true);
      const verified = await isEmailVerified();
      setVerified(verified);
      setChecking(false);
    }, 5000);

    const timerInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(verificationInterval);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    if (verified) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [verified]);



  const handleResendEmail = async () => {
    try {
      const user = auth().currentUser;
  
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        setCountdown(30);
        Alert.alert('Succes', 'Un nouvel email de vérification a été envoyé !');
      } else {
        setError("Utilisateur non connecté ou email déjà vérifié.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi de l'email de vérification.");
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6e45e2', '#88d3ce']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Image 
            source={require('../../assets/email-verification.png')} 
            style={styles.image}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Vérification d'email requise</Text>
          
          <Text style={styles.subtitle}>
            Nous avons envoyé un lien de vérification à votre adresse email.
            Veuillez cliquer sur ce lien pour activer votre compte.
          </Text>

          <View style={styles.statusContainer}>
            {checking ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.statusText}>Vérification en cours...</Text>
              </>
            ) : (
              <Text style={styles.statusText}>
                {verified ? 'Email vérifié !' : 'En attente de vérification...'}
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.resendButton}
            onPress={handleResendEmail}
            disabled={countdown > 0}
          >
            <Text style={styles.resendButtonText}>
              {countdown > 0 
                ? `Renvoyer l'email (${countdown}s)` 
                : 'Renvoyer l\'email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={logout}
          >
            <Ionicons name="log-out" size={20} color="#6e45e2" />
            <Text style={styles.logoutButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
  },
  resendButton: {
    backgroundColor: '#6e45e2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    opacity: 1,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  logoutButtonText: {
    color: '#6e45e2',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;