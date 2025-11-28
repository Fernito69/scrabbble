import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const firestoreService = {
  getCollection: async <T = DocumentData>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ) => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  getDocument: async <T = DocumentData>(
    collectionName: string,
    documentId: string
  ) => {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  addDocument: async <T = DocumentData>(
    collectionName: string,
    data: T
  ) => {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data as DocumentData);
    return docRef.id;
  },

  updateDocument: async (
    collectionName: string,
    documentId: string,
    data: Partial<DocumentData>
  ) => {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
  },

  deleteDocument: async (
    collectionName: string,
    documentId: string
  ) => {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  },

  whereQuery: where,
};
