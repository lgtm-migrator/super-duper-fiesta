export const setResolutionType = resolutionType => ({
  type: 'SET_RESOLUTION_TYPE',
  resolutionType,
});

export const setQuestionType = questionType => ({
  type: 'SET_QUESTION_TYPE',
  questionType,
});

export const setAlternativeText = text => ({
  type: 'SET_ALTERNATIVE_TEXT',
  text,
});

export const clearAlternativeText = () => ({
  type: 'CLEAR_ALTERNATIVE_TEXT',
});

let alternativeCount = 0;

export const addAlternative = text => ({
  type: 'ADD_ISSUE_ALTERNATIVE',
  id: alternativeCount++,
  text,
});

export const removeAlternative = id => ({
  type: 'REMOVE_ISSUE_ALTERNATIVE',
  id,
});

export const toggleSetting = id => ({
  type: 'TOGGLE_ISSUE_SETTING',
  id,
});
