import React, { useEffect, useState } from 'react';
import { addQuestionToDocument, fetchQuestionsAndVideoByName, updateAnswers, uploadVideo, updateVideoURL } from '../firebase/firebaseController';
import { useAuth } from '../firebase/AuthContext';

const ActionMovies: React.FC = () => {
  const [questions, setQuestions] = useState<Array<string>>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const { user } = useAuth();
  const [editedItems, setEditedItems] = useState<Array<string>>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const { questions, videoURL } = await fetchQuestionsAndVideoByName("questionares", "actionMovies");
        setQuestions(questions);
        setEditedItems([...questions]);
        setVideoURL(videoURL);
      } catch (error) {
        console.error("Failed to load content:", error);
      }
    };

    loadContent();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const updatedItems = [...editedItems];
    updatedItems[index] = value;
    setEditedItems(updatedItems);
  };

  const handleSave = async () => {
    try {
      await updateAnswers("questionares", "actionMovies", editedItems);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Failed to save changes.");
    }
  };

  const handleAddQuestion = async () => {
    if (newQuestion.trim() !== '') {
      try {
        await addQuestionToDocument("questionares", "actionMovies", newQuestion);
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
        setNewQuestion('');
        alert("New question added successfully!");
      } catch (error) {
        console.error("Failed to add new question:", error);
        alert("Failed to add new question.");
      }
    }
  };

  // Function to upload a video file and update the video URL in the document
  const handleVideoUpload = async (file: File) => {
    try {
      const result = await uploadVideo(file);

      if (result) {
        const { downloadURL } = result;
        console.log("Uploaded video URL:", downloadURL);

        // Update the document with the new video URL
        await updateVideoURL("questionares", "actionMovies", downloadURL);
        alert("Video uploaded and URL updated successfully!");
      }
    } catch (error) {
      console.error("Error handling video upload:", error);
      alert("Failed to upload video and update URL.");
    }
  };

  return (
    <div>
      {videoURL ? (
        <div>
          <h3>Watch Video</h3>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <video 
              controls 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <source src={videoURL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ) : (
        <p>No video available.</p>
      )}
      <ul>
        {questions.length > 1 ? (
          questions.map((item, index) => 
            index % 2 === 0 && index + 1 < questions.length ? (
            <li key={index / 2} style={{ marginBottom: '1rem' }}>
              <strong>Question: </strong>
              {user ? (
                <input
                  type="text"
                  value={editedItems[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder="Question"
                />
              ) : (
                <span>{item}</span>
              )}

              <br />

              <strong>Answer: </strong>
              {user ? (
                <input
                  type="text"
                  value={editedItems[index + 1] || ''}
                  onChange={(e) => handleInputChange(index + 1, e.target.value)}
                  placeholder="Answer"
                />
              ) : (
                <span>{questions[index + 1]}</span>
              )}
            </li>
          ) : null)
        ) : (
          <li>No questions available.</li>
        )}
      </ul>

      {user && (
        <div>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add a new question"
          />
          <button onClick={handleAddQuestion}>Add Question</button>
        </div>
      )}

      {user && 
        <div>
          <button onClick={handleSave}>Save Changes</button>
          <input type="file" accept="video/*" onChange={(e) => {
            if (e.target.files?.[0]) {
              handleVideoUpload(e.target.files[0]);
            }
          }} />
        </div>
      }
    </div>
  );
};

export default ActionMovies;
