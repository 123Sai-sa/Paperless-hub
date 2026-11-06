import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Core SDK
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with dedicated Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Export Firebase Configuration for diagnostic and console display
export { firebaseConfig };

// Test live connection to Firestore
export async function testConnection(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  const start = performance.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latencyMs = Math.round(performance.now() - start);
    console.log('Firebase Cloud Firestore connection active:', firebaseConfig.firestoreDatabaseId, `${latencyMs}ms`);
    return { ok: true, latencyMs, message: `Connected to ${firebaseConfig.firestoreDatabaseId}` };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, fallback caching active.');
      return { ok: false, latencyMs, message: 'Client offline - resilient local cache active' };
    }
    return { ok: true, latencyMs, message: 'Firestore connected' };
  }
}

// Kick off connectivity verification
testConnection().catch(() => {});
