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
} from '@ionic/react';
import {
  addGuestComment,
  fetchGuestComments,
  deleteGuestComment,
} from '../../firebase/firebaseController';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import './SignGuestBook.css';

const SignGuestBook: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<
    Array<{ id: string; name: string; comment: string; createdAt: Date | null }>
  >([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profanityWarning, setProfanityWarning] = useState<string>('');

  useEffect(() => {
    const loadComments = async () => {
      try {
        const commentsData = await fetchGuestComments();
        setComments(
          commentsData as Array<{
            id: string;
            name: string;
            comment: string;
            createdAt: Date | null;
          }>
        );
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();

    const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    if (user && user.email === adminEmail) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleAddComment = async () => {
    if (name && comment) {
      // Perform profanity check
      const hasProfanity = containsProfanity(name) || containsProfanity(comment);

      if (hasProfanity) {
        setProfanityWarning("Let's try and keep it clean");
        return;
      }

      try {
        await addGuestComment(name, comment);
        const commentsData = await fetchGuestComments();
        setComments(
          commentsData as Array<{
            id: string;
            name: string;
            comment: string;
            createdAt: Date | null;
          }>
        );
        setName('');
        setComment('');
        setProfanityWarning(''); // Clear warning after successful addition
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const containsProfanity = (text:string) => {
    const profaneWords = [
      'fuck',
      'shit',
      'nazi',
      'slut',
      'whore',
      'cunt',
      'bitch',
      'asshole',
      'ass-hole',
      'kkk',
      'trump',
    ];

    return profaneWords.some((word) => text.toLowerCase().includes(word));
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteGuestComment(id);
      setComments(comments.filter((comment) => comment.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const goToHome = () => {
    history.push('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton className="mapPageButton" onClick={goToHome}>
              Home
            </IonButton>
            <IonTitle style={{color: '#f7870f'}}>Sign the Guest Book</IonTitle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <div className="home-container">
        <img 
          src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FbackdropSky2.jpg?alt=media&token=c21edae9-5e3a-4d67-8b1c-2b5cb058d304" 
          alt="Background" 
          className="home-background-image"
        />
      </div>
        <IonCard className="centered-card">
          <IonInput
            value={name}
            placeholder="Your Name"
            onIonInput={(e) => setName(e.detail.value!)}
          />
          <IonInput
            value={comment}
            placeholder="Your Comment"
            onIonInput={(e) => setComment(e.detail.value!)}
          />
          <IonButton className="addCommentButton" onClick={handleAddComment}>Add Comment</IonButton>
          {profanityWarning && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              {profanityWarning}
            </div>
          )}
        </IonCard>
        <div className='commentListHolder'>
          <IonList className='commentList'>
            {comments
              .slice()
              //@ts-ignore
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(({ id, name, comment, createdAt }) => (
                <IonItem key={id} className='commentItem'>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span style={{ 
                      display: 'block', 
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word', 
                      wordBreak: 'break-word',
                      color: '#f7870f'
                    }}>
                      <strong>{name}:</strong> {comment}
                      {createdAt && (
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(createdAt))}
                        </div>
                      )}
                    </span>
                    {isAdmin && (
                      <IonButton
                        color="danger"
                        onClick={() => handleDeleteComment(id)}
                      >
                        Delete
                      </IonButton>
                    )}
                  </div>
                </IonItem>
              ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignGuestBook;
