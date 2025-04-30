import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonList, IonItem } from '@ionic/react';
import { addGuestComment, fetchGuestComments, deleteGuestComment } from '../../firebase/firebaseController';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext'; // Accessing AuthContext

const SignGuestBook: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth(); // Get the user object from the auth context
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<Array<{ id: string; name: string; comment: string; createdAt: Date | null }>>([]);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const commentsData = await fetchGuestComments();
        setComments(commentsData as Array<{ id: string; name: string; comment: string; createdAt: Date | null }>);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();

    // Check if the current user is an admin
    const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    if (user && user.email === adminEmail) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleAddComment = async () => {
    if (name && comment) {
      try {
        await addGuestComment(name, comment);
        const commentsData = await fetchGuestComments();
        setComments(commentsData as Array<{ id: string; name: string; comment: string; createdAt: Date | null }>);
        setName('');
        setComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteGuestComment(id);
      setComments(comments.filter(comment => comment.id !== id));
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
          <IonTitle>Guest Book</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
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
        <IonButton onClick={handleAddComment}>Add Comment</IonButton>

        <IonList>
          {comments.map(({ id, name, comment, createdAt }) => (
            <IonItem key={id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>
                  <strong>{name}:</strong> {comment}
                  {createdAt && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt)}
                    </div>
                  )}
                </span>
                {isAdmin && (
                  <IonButton color="danger" onClick={() => handleDeleteComment(id)}>
                    Delete
                  </IonButton>
                )}
              </div>
            </IonItem>
          ))}
        </IonList>

        {/* Home Button */}
        <IonButton onClick={goToHome} color="primary">
          Home
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SignGuestBook;
