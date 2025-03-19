import { StyleSheet, Text, View, Switch, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.getPermissionsAsync();
      setIsEnabled(status === 'granted');
    }
  };

  const togglePermissions = async () => {
    if (Platform.OS === 'web') return;

    if (!isEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      setIsEnabled(status === 'granted');
    } else {
      // On Android, we can't programmatically revoke permissions
      // Direct user to system settings instead
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.allowFontScaling = false;
      alert('Please disable notifications in your device settings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Notification Access</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#007AFF' : '#f4f3f4'}
          onValueChange={togglePermissions}
          value={isEnabled}
          disabled={Platform.OS === 'web'}
        />
      </View>
      {Platform.OS === 'web' && (
        <Text style={styles.webWarning}>
          Notification settings are not available on web platforms.
          Please use an Android device.
        </Text>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About Notification Access</Text>
        <Text style={styles.infoText}>
          This app requires notification access permission to read notifications from other apps.
          The app will store notifications locally and does not send them to any external servers.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  webWarning: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a4a4a',
  },
});