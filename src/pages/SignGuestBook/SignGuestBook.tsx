import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonList,
  IonItem,
  IonCard,
  IonButtons,
  IonToast,
} from '@ionic/react';
import {
  addGuestComment,
  fetchGuestComments,
  deleteGuestComment,
} from '../../firebase/firebaseController';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import type { GuestComment } from '../../firebase/types';
import './SignGuestBook.css';

const PROFANE_WORDS = [
  'fuck', 'shit', 'nazi', 'slut', 'whore',
  'cunt', 'bitch', 'asshole', 'ass-hole', 'kkk',
];

const containsProfanity = (text: string): boolean =>
  PROFANE_WORDS.some((word) => text.toLowerCase().includes(word));

const SignGuestBook: React.FC = () => {
  const history = useHistory();
  const { isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<GuestComment[]>([]);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const data = await fetchGuestComments();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!name.trim() || !comment.trim()) return;

    if (containsProfanity(name) || containsProfanity(comment)) {
      setWarning("Let's try and keep it clean");
      return;
    }

    try {
      await addGuestComment(name.trim(), comment.trim());
      await loadComments();
      setName('');
      setComment('');
      setWarning('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuestComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="btn-nav" onClick={() => history.push('/home')}>
              Home
            </IonButton>
          </IonButtons>
          <IonTitle style={{ color: 'var(--color-primary)' }}>Sign the Guest Book</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="page-background">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FbackdropSky2.jpg?alt=media&token=c21edae9-5e3a-4d67-8b1c-2b5cb058d304"
            alt="Background"
          />
        </div>

        <div className="guestbook-content">
          <IonCard className="guestbook-form">
            <IonInput
              value={name}
              placeholder="Name"
              onIonInput={(e) => setName(e.detail.value ?? '')}
            />
            <IonInput
              value={comment}
              placeholder="Let us know you were here!"
              onIonInput={(e) => setComment(e.detail.value ?? '')}
            />
            <IonButton className="btn-primary" onClick={handleAddComment}>
              Add Comment
            </IonButton>
          </IonCard>

          <div className="guestbook-list-container">
            <IonList className="guestbook-list">
              {sortedComments.map(({ id, name, comment, createdAt }) => (
                <IonItem key={id} className="guestbook-item">
                  <div className="guestbook-comment">
                    <span className="guestbook-comment-text">
                      <strong>{name}:</strong> {comment}
                      {createdAt && (
                        <div className="guestbook-date">
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(createdAt)}
                        </div>
                      )}
                    </span>
                    {isAdmin && (
                      <IonButton color="danger" onClick={() => handleDelete(id)}>
                        Delete
                      </IonButton>
                    )}
                  </div>
                </IonItem>
              ))}
            </IonList>
          </div>
        </div>

        <IonToast
          className="toastFail"
          isOpen={!!warning}
          message={warning}
          onDidDismiss={() => setWarning('')}
          duration={3000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default SignGuestBook;
