import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

declare const firebaseConfig: FirebaseConfig;
declare const app: FirebaseApp;
export declare const db: Firestore; 