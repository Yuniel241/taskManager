import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
  route?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const { login, sendPasswordResetEmail } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState({
    login: false,
    reset: false,
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (route?.params?.message) {
      setError('');
      setSuccessMessage(route.params.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer); // Correction ici
    }
  }, [route?.params?.message]);

  const validateForm = (): boolean => {
    setError('');
    
    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return false;
    }
    
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }
    
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return false;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    return true;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(prev => ({ ...prev, login: true }));
    setError('');
    setSuccessMessage('');
    
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await userCredential.user.sendEmailVerification();
        setError('Veuillez valider votre adresse email avant de continuer.');
        return;
      }
      setSuccessMessage('Connexion réussie !');

    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage ='Aucun utilisateur trouvé avec cet email';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Adresse email ou mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Compte temporairement bloqué';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Problème de connexion réseau';
          break;
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  };

  const handlePasswordReset = async (): Promise<void> => {
    if (!email.trim()) {
      setError('Veuillez entrer votre email pour réinitialiser le mot de passe');
      return;
    }
  
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }
  
    setLoading(prev => ({ ...prev, reset: true }));
    setError('');
    
    try {
      await sendPasswordResetEmail(email);
      setSuccessMessage(`Un email de réinitialisation a été envoyé à ${email}`);
      
      // Déplacer le setTimeout dans le scope de la fonction
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      let errorMessage = "Erreur lors de l'envoi de l'email de réinitialisation";
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Aucun utilisateur trouvé avec cet email';
      }
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, reset: false }));
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/registerBg.jpg')} 
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <LinearGradient
        colors={['rgba(110, 69, 226, 0.85)', 'rgba(136, 211, 206, 0.85)']}
        style={styles.gradientOverlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.card}>
                <View style={styles.logoContainer}>
                  <Icon 
                    name="shield-account" 
                    size={80} 
                    color="#FFF" 
                    style={styles.logo} 
                  />
                  <Text variant="headlineMedium" style={styles.title}>
                    Connexion
                  </Text>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={20} color="#FFF" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {successMessage ? (
                  <View style={styles.successContainer}>
                    <Icon name="check-circle" size={20} color="#FFF" />
                    <Text style={styles.successText}>{successMessage}</Text>
                  </View>
                ) : null}

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  mode="flat"
                  left={<TextInput.Icon icon="email" color="#FFF" />}
                  theme={{ 
                    colors: { 
                      primary: '#FFF',
                      text: '#FFF',
                      placeholder: 'rgba(255,255,255,0.7)',
                      background: 'transparent',
                    } 
                  }}
                  disabled={loading.login || loading.reset}
                />

                <TextInput
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  style={styles.input}
                  mode="flat"
                  left={<TextInput.Icon icon="lock" color="#FFF" />}
                  right={
                    <TextInput.Icon
                      icon={secureTextEntry ? 'eye-off' : 'eye'}
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                      color="#FFF"
                    />
                  }
                  theme={{ 
                    colors: { 
                      primary: '#FFF',
                      text: '#FFF',
                      placeholder: 'rgba(255,255,255,0.7)',
                      background: 'transparent',
                    } 
                  }}
                  disabled={loading.login || loading.reset}
                />

                <TouchableOpacity 
                  onPress={handlePasswordReset} 
                  disabled={!email || loading.reset || loading.login}
                  style={styles.forgotPasswordButton}
                >
                  {loading.reset ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.forgotPasswordText}>
                      Mot de passe oublié ?
                    </Text>
                  )}
                </TouchableOpacity>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={loading.login}
                  disabled={loading.login || loading.reset}
                  labelStyle={styles.buttonLabel}
                  contentStyle={styles.buttonContent}
                >
                  {loading.login ? '' : 'Se connecter'}
                </Button>

                {!isKeyboardVisible && (
                  <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Pas encore de compte ? </Text>
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('Register')}
                      disabled={loading.login || loading.reset}
                    >
                      <Text style={styles.registerLink}>
                        S'inscrire
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 30,
    filter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    marginBottom: 15,
  },
  title: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  loginButton: {
    marginTop: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    height: 50,
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#6e45e2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContent: {
    height: 50,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.5)',
  },
  errorText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1,
  },
  successText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLink: {
    color: '#FFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;