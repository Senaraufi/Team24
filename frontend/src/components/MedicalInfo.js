export const MEDICAL_INFO = {
  'chest pain': {
    priority: 'HIGH',
    actions: [
      'Check if pain radiates to arm/jaw',
      'Ask about breathing difficulty',
      'Note pain intensity (1-10)',
      'Check pulse rate'
    ],
    questions: [
      'When did the pain start?',
      'Any previous heart conditions?',
      'Taking any medications?',
      'Pain worse with movement?'
    ],
    precautions: [
      'Keep patient seated and calm',
      'Loosen tight clothing',
      'Have patient stop physical activity'
    ]
  },
  'difficulty breathing': {
    priority: 'HIGH',
    actions: [
      'Check oxygen saturation if possible',
      'Note breathing rate',
      'Observe chest movement'
    ],
    questions: [
      'Can you speak full sentences?',
      'Any known lung conditions?',
      'Using any inhalers?'
    ],
    precautions: [
      'Keep patient in upright position',
      'Ensure clear airway',
      'Remove any restrictions around chest/neck'
    ]
  },
  // Add more conditions as needed
};

export const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

export const extractRelevantInfo = (symptoms) => {
  let allInfo = {
    actions: new Set(),
    questions: new Set(),
    precautions: new Set(),
    priority: 'LOW'
  };

  symptoms.forEach(symptom => {
    const info = MEDICAL_INFO[symptom.toLowerCase()];
    if (info) {
      info.actions.forEach(action => allInfo.actions.add(action));
      info.questions.forEach(question => allInfo.questions.add(question));
      info.precautions.forEach(precaution => allInfo.precautions.add(precaution));
      if (info.priority === 'HIGH') allInfo.priority = 'HIGH';
    }
  });

  return {
    actions: Array.from(allInfo.actions),
    questions: Array.from(allInfo.questions),
    precautions: Array.from(allInfo.precautions),
    priority: allInfo.priority
  };
};
