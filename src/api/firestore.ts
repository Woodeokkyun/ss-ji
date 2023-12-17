import {
  DocumentReference,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  deleteDoc,
} from 'firebase/firestore';

import { firestore } from '../utils/firebase';
import { IQuiz } from '../../model';

interface IQuizDraft {
  quizzes: IQuiz[];
  title: string;
  subTitle?: string;
  updatedAt?: string;
}

export interface IQuizzesList {
  id: string;
  title: string;
  subTitle?: string;
  quizzes: IQuiz[];
  updatedAt: string;
}

export const fetchQuizzesList = async (
  userId: string
): Promise<IQuizzesList[] | null> => {
  const quizzesList = await getDocs(
    collection(firestore, `users/${userId}/quizzes`)
  );

  const quizzesListData: IQuizzesList[] = [];
  quizzesList.forEach((doc) => {
    quizzesListData.push({
      id: doc.id,
      title: doc.data().title,
      subTitle: doc.data().subTitle,
      updatedAt: doc.data().updatedAt,
      quizzes: doc.data().quizzes,
    });
  });
  return quizzesListData;
};

export const fetchQuizzes = async (
  userId: string,
  quizzesId: string
): Promise<IQuizDraft | null> => {
  const draftDoc = await getDoc(
    doc(
      firestore,
      `users/${userId}/quizzes`,
      quizzesId.toString()
    ) as DocumentReference<IQuizDraft>
  );

  if (!draftDoc.exists()) {
    return null;
  }

  const data = draftDoc.data();
  return data;
};

export const postQuizzes = async (
  data: { userId: string; quizzesId: string } & IQuizDraft
) => {
  const { userId, title, subTitle, quizzes, quizzesId } = data;
  const cleanQuizzes = JSON.parse(JSON.stringify(quizzes));
  const now = new Date();
  const docData = {
    title,
    ...(subTitle ? { subTitle } : {}),
    quizzes: cleanQuizzes,
    updatedAt: `${now.toDateString()} ${now.toTimeString().split(' ')[0]}`,
  };
  const docRef = doc(
    firestore,
    `users/${userId}/quizzes`,
    quizzesId.toString()
  ) as DocumentReference<IQuizDraft>;

  return await setDoc(docRef, docData);
};

export const deleteQuizzes = async (
  userId: string,
  quizzesId: string
): Promise<void> => {
  const docRef = doc(
    firestore,
    `users/${userId}/quizzes`,
    quizzesId.toString()
  ) as DocumentReference<IQuizDraft>;

  return await deleteDoc(docRef);
};
