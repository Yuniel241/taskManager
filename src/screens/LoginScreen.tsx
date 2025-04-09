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
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoginScreenProps {
  navigation: any;
  route?:any
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <Icon 
              name="account-circle" 
              size={100} 
              color={colors.primary} 
              style={styles.icon} 
            />
            
            <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
              Connexion
            </Text>

            {error ? (
              <View style={[styles.messageContainer, styles.errorContainer]}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={[styles.messageContainer, styles.successContainer]}>
                <Icon name="check-circle" size={20} color={colors.primary} />
                <Text style={[styles.success, { color: colors.primary }]}>{successMessage}</Text>
              </View>
            ) : null}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" color={colors.primary} />}
              theme={{ 
                colors: { 
                  primary: colors.primary,
                  background: colors.surface,
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
              mode="outlined"
              left={<TextInput.Icon icon="lock" color={colors.primary} />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye-off' : 'eye'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  color={colors.primary}
                  disabled={loading.login || loading.reset}
                />
              }
              theme={{ 
                colors: { 
                  primary: colors.primary,
                  background: colors.surface,
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
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.forgotPassword,
                    { 
                      color: !email ? colors.onSurfaceDisabled : colors.primary,
                      opacity: !email ? 0.6 : 1,
                    },
                  ]}
                >
                  Mot de passe oublié ?
                </Text>
              )}
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={[styles.button, { backgroundColor: colors.primary }]}
              loading={loading.login}
              disabled={loading.login || loading.reset}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {loading.login ? '' : 'Se connecter'}
            </Button>

            {!isKeyboardVisible && (
              <View style={styles.registerContainer}>
                <Text style={{ color: colors.onSurface }}>Pas encore de compte ? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading.login || loading.reset}
                >
                  <Text style={{ 
                    color: loading.login || loading.reset ? colors.onSurfaceDisabled : colors.primary, 
                    fontWeight: 'bold' 
                  }}>
                    S'inscrire
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    padding: 24,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    height: 48,
    lineHeight: 48,
  },
  buttonContent: {
    height: 48,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  successContainer: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  error: {
    marginLeft: 8,
    fontSize: 14,
    flexShrink: 1,
  },
  success: {
    marginLeft: 8,
    fontSize: 14,
    flexShrink: 1,
  },
  forgotPassword: {
    fontSize: 14,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    padding: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});

export default LoginScreen;