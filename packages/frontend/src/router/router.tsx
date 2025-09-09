import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';
const LandingPage = lazy(() => import('../views/Saas/LandingPage'));
const Main = lazy(() => import('../views/Main'));
const InterviewSummaryMine = lazy(() => import('../views/Main/InterviewSummary/Mine'));
const InterviewSummaryMarket = lazy(() => import('../views/Main/InterviewSummary/Market'));
const InterviewSummaryRead = lazy(() => import('../views/Main/InterviewSummary/Mine/SummaryRead'));
const AnkiPage = lazy(() => import('../views/Main/InterviewSummary/Anki'));
const ModelConfig = lazy(() => import('../views/Main/Apikey'));
const UserManagePage = lazy(() => import('../views/Main/Manage/User'));
const ServiceManagePage = lazy(() => import('../views/Main/Manage/Service'));
const NotificationManagePage = lazy(() => import('../views/Main/Manage/Notifaction'));
const UserNotificationPage = lazy(() => import('../views/Main/Notifaction'));
const InterviewQuestionHotPage = lazy(() => import('../views/Main/InterviewQuestion/Hot'));
const InterviewQuestionMinePage = lazy(() => import('../views/Main/InterviewQuestion/Mine'));
const InterviewQuestionReadPage = lazy(
	() => import('../views/Main/InterviewQuestion/components/QusetionRead')
);
const NotFoundPage = lazy(() => import('../views/Saas/NotFound'));
const LoginPage = lazy(() => import('../views/LoginRegist/login'));
const RegisterPage = lazy(() => import('../views/LoginRegist/regist'));
const InterviewSummaryAction = lazy(() => import('../views/Main/InterviewSummary/Action'));
const AIChat = lazy(() => import('../views/Main/aichat/AIChat'));

export const routes = [
	{
		path: '',
		element: <Navigate to="/saas" />
	},
	{
		path: '*',
		element: <NotFoundPage />
	},
	{
		path: '/aichat',
		element: <AIChat />
	},
	{
		path: '/saas',
		element: <LandingPage />
	},
	{
		path: '/login',
		element: <LoginPage />
	},
	{
		path: '/register',
		element: <RegisterPage />
	},
	{
		path: '/main',
		element: (
			<PrivateRoute>
				<Main />
			</PrivateRoute>
		),
		children: [
			{
				path: '',
				element: <Navigate to="/main/interview-summary/mine" />
			},
			{
				path: '/main/aichat',
				element: (
					<UpdateBreadRouter>
						<AIChat />
					</UpdateBreadRouter>
				)
			},
			// 首页
			{
				path: '/main/home',
				element: <Navigate to="/main/interview-question/mine" />
			},
			// 面经
			{
				path: '/main/interview-summary',
				element: (
					<UpdateBreadRouter>
						<Outlet />
					</UpdateBreadRouter>
				),
				children: [
					{
						path: '',
						element: <Navigate to="/main/interview-summary/mine" />
					},
					{
						path: 'mine',
						element: (
							<UpdateBreadRouter>
								<InterviewSummaryMine />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'action',
						element: (
							<UpdateBreadRouter>
								<InterviewSummaryAction />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'market',
						element: (
							<UpdateBreadRouter>
								<InterviewSummaryMarket />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:summaryId',
						element: (
							<UpdateBreadRouter>
								<InterviewSummaryRead />
							</UpdateBreadRouter>
						)
					},
					{
						path: '/main/interview-summary/anki',
						element: (
							<UpdateBreadRouter>
								<AnkiPage />
							</UpdateBreadRouter>
						)
					}
				]
			},
			// API 密钥设置
			{
				path: '/main/model-config',
				element: (
					<UpdateBreadRouter>
						<ModelConfig />
					</UpdateBreadRouter>
				)
			},
			// 通知中心
			{
				path: '/main/notification',
				element: (
					<UpdateBreadRouter>
						<UserNotificationPage />
					</UpdateBreadRouter>
				)
			},
			// 热门面试题
			{
				path: '/main/interview-question',
				element: (
					<UpdateBreadRouter>
						<Outlet />
					</UpdateBreadRouter>
				),
				children: [
					{
						path: '',
						element: <Navigate to="/main/interview-question/mine" />
					},
					{
						path: 'hot',
						element: (
							<UpdateBreadRouter>
								<InterviewQuestionHotPage />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'mine',
						element: (
							<UpdateBreadRouter>
								<InterviewQuestionMinePage />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:questionId',
						element: (
							<UpdateBreadRouter>
								<InterviewQuestionReadPage />
							</UpdateBreadRouter>
						)
					}
				]
			},
			// 管理后台
			{
				path: '/main/manage',
				element: (
					<UpdateBreadRouter>
						<Outlet />
					</UpdateBreadRouter>
				),
				children: [
					{
						path: '',
						element: <Navigate to="/main/manage/user" />
					},
					{
						path: 'user',
						element: (
							<UpdateBreadRouter>
								<UserManagePage />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'service',
						element: (
							<UpdateBreadRouter>
								<ServiceManagePage />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'notification',
						element: (
							<UpdateBreadRouter>
								<NotificationManagePage />
							</UpdateBreadRouter>
						)
					}
				]
			}
		]
	}
];

/* 用于面包屑导航 */
export const path_name: Record<string, string> = {
	'/main/home': '首页',

	'/main/interview-summary': '面经',
	'/main/interview-summary/mine': '面经-我的面经',
	'/main/interview-summary/market': '面经-市场',
	'/main/interview-summary/detail': '面经-详情',
	'/main/interview-summary/anki': '面经-Anki 同步',

	'/main/interview-summary/action': '面经-数据管理',

	'/main/model-config': 'API 密钥设置',

	'/main/notification': '通知中心',

	'/main/interview-question': '面试题',
	'/main/interview-question/hot': '面试题-Hot 100',
	'/main/interview-question/mine': '面试题-我的面试题',
	'/main/interview-question/detail': '面试题-详情',

	'/main/aichat': '问问 Prisma',

	'/main/manage': '管理后台',
	'/main/manage/user': '管理后台-用户管理',
	'/main/manage/service': '管理后台-服务状态',
	'/main/manage/notification': '管理后台-通知管理'
};
