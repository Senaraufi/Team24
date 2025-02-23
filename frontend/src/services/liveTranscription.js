const GOOGLE_API_KEY = 'AIzaSyDy9IPY_MudCHq7N0aaZCvJhy2Zy2Q6i8k';

let recognition = null;
let transcriptionCallbacks = [];

const INJURIES_AND_SYMPTOMS = {
  injuries: [
    'broken', 'fracture', 'cut', 'bleeding', 'burn', 'wound', 'sprain',
    'head injury', 'concussion', 'bruise', 'laceration', 'trauma'
  ],
  symptoms: [
    'pain', 'chest pain', 'difficulty breathing', 'shortness of breath',
    'dizzy', 'dizziness', 'nausea', 'vomiting', 'fever', 'headache',
    'unconscious', 'not breathing', 'seizure', 'stroke', 'heart attack',
    'allergic', 'swelling', 'weakness', 'numbness', 'paralysis'
  ]
};

const detectInjuriesAndSymptoms = (transcript) => {
  const lowerText = transcript.toLowerCase();
  const found = {
    injuries: [],
    symptoms: []
  };

  INJURIES_AND_SYMPTOMS.injuries.forEach(injury => {
    if (lowerText.includes(injury.toLowerCase())) {
      found.injuries.push(injury);
    }
  });

  INJURIES_AND_SYMPTOMS.symptoms.forEach(symptom => {
    if (lowerText.includes(symptom.toLowerCase())) {
      found.symptoms.push(symptom);
    }
  });

  return found;
};

export const startLiveTranscription = (onTranscriptionUpdate) => {
  if (!('webkitSpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return false;
  }

  recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    console.log('Speech recognition started');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Detect injuries and symptoms in final transcript
    const detectedConditions = finalTranscript ? 
      detectInjuriesAndSymptoms(finalTranscript) : null;

    // Notify callbacks with simplified data structure
    transcriptionCallbacks.forEach(callback => 
      callback({
        interim: interimTranscript,
        final: finalTranscript,
        detected: detectedConditions
      })
    );
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
    // Automatically restart if it ends unexpectedly
    recognition.start();
  };

  if (onTranscriptionUpdate) {
    transcriptionCallbacks.push(onTranscriptionUpdate);
  }

  try {
    recognition.start();
    return true;
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    return false;
  }
};

export const stopLiveTranscription = () => {
  if (recognition) {
    recognition.stop();
    transcriptionCallbacks = [];
  }
};
