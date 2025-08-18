import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { EncryptedBackup, BackupData } from '@/types';
import { encryptBackup, decryptBackup } from '@/crypto/backup';

// Firebase Cloud Backup Service
export class CloudBackupService {
  private static instance: CloudBackupService;
  
  static getInstance(): CloudBackupService {
    if (!CloudBackupService.instance) {
      CloudBackupService.instance = new CloudBackupService();
    }
    return CloudBackupService.instance;
  }

  // Anonymous authentication for cloud access
  async authenticateAnonymously(): Promise<string> {
    try {
      const userCredential = await auth().signInAnonymously();
      return userCredential.user.uid;
    } catch (error) {
      console.error('Firebase anonymous auth failed:', error);
      throw new Error('Failed to authenticate with cloud service');
    }
  }

  // Upload encrypted backup to Firebase Storage
  async uploadBackup(data: BackupData, passphrase: string, deviceId: string): Promise<void> {
    try {
      // Ensure anonymous authentication
      const userId = await this.authenticateAnonymously();
      
      // Encrypt backup data
      const encryptedBackup = await encryptBackup(data, passphrase);
      
      // Create backup metadata
      const backupMetadata = {
        deviceId,
        timestamp: encryptedBackup.timestamp,
        version: data.version,
        createdAt: new Date(),
      };

      // Upload encrypted backup to Storage
      const storageRef = storage().ref(`backups/${userId}/${deviceId}/wallet-backup.json`);
      await storageRef.putString(JSON.stringify(encryptedBackup));

      // Save metadata to Firestore
      const metadataRef = firestore()
        .collection('backup-metadata')
        .doc(userId)
        .collection('devices')
        .doc(deviceId);
      
      await metadataRef.set(backupMetadata);

      console.log('Backup uploaded successfully');
    } catch (error) {
      console.error('Backup upload failed:', error);
      throw new Error('Failed to upload backup to cloud');
    }
  }

  // Download and decrypt backup from Firebase Storage
  async downloadBackup(passphrase: string, deviceId: string): Promise<BackupData> {
    try {
      // Ensure anonymous authentication
      const userId = await this.authenticateAnonymously();
      
      // Download encrypted backup from Storage
      const storageRef = storage().ref(`backups/${userId}/${deviceId}/wallet-backup.json`);
      const downloadUrl = await storageRef.getDownloadURL();
      
      // Fetch the backup data
      const response = await fetch(downloadUrl);
      const encryptedBackup: EncryptedBackup = await response.json();
      
      // Decrypt backup data
      const backupData = await decryptBackup(encryptedBackup, passphrase);
      
      console.log('Backup downloaded and decrypted successfully');
      return backupData;
    } catch (error) {
      console.error('Backup download failed:', error);
      throw new Error('Failed to download backup from cloud');
    }
  }

  // List available backups for the current user
  async listBackups(): Promise<Array<{ deviceId: string; timestamp: number; version: number }>> {
    try {
      // Ensure anonymous authentication
      const userId = await this.authenticateAnonymously();
      
      // Query backup metadata from Firestore
      const metadataCollection = firestore()
        .collection('backup-metadata')
        .doc(userId)
        .collection('devices');
      
      const querySnapshot = await metadataCollection.get();
      
      const backups = querySnapshot.docs.map(doc => ({
        deviceId: doc.id,
        timestamp: doc.data().timestamp,
        version: doc.data().version,
      }));

      return backups;
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw new Error('Failed to list available backups');
    }
  }

  // Delete backup from cloud
  async deleteBackup(deviceId: string): Promise<void> {
    try {
      // Ensure anonymous authentication
      const userId = await this.authenticateAnonymously();
      
      // Delete from Storage
      const storageRef = storage().ref(`backups/${userId}/${deviceId}/wallet-backup.json`);
      await storageRef.delete();

      // Delete metadata from Firestore
      const metadataRef = firestore()
        .collection('backup-metadata')
        .doc(userId)
        .collection('devices')
        .doc(deviceId);
      
      await metadataRef.delete();

      console.log('Backup deleted successfully');
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw new Error('Failed to delete backup from cloud');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth().currentUser !== null;
  }

  // Sign out (clear anonymous session)
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
}

// Singleton instance
export const cloudBackupService = CloudBackupService.getInstance();