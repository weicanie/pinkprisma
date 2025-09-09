import { configureStore } from '@reduxjs/toolkit';
import { AIChatReducer } from './aichat';
import { breadRouterReducer } from './bread-router';
import { controlPanelReducer } from './controlPanelSlice';
import { InterviewSummaryReducer } from './InterviewSummary';
import { InterviewQuestionReducer } from './interviewQuestion';
import { JobReducer } from './jobs';
import { knowledgeReducer } from './knowbase';
import { loginReducer } from './login';
import { notificationReducer } from './notification';

const store = configureStore({
	reducer: {
		breadRouter: breadRouterReducer,
		job: JobReducer,
		knowledge: knowledgeReducer,
		interviewSummary: InterviewSummaryReducer,
		interviewQuestion: InterviewQuestionReducer,
		login: loginReducer,
		notification: notificationReducer,
		aichat: AIChatReducer,
		controlPanel: controlPanelReducer
	}
});

export default store;
