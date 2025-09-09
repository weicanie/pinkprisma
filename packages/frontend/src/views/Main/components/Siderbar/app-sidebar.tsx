import {
	Book,
	BookKey,
	Bot,
	KeyRound,
	LibraryBig,
	MonitorCog,
	Pyramid,
	Rocket,
	Search,
	Settings,
	Target
} from 'lucide-react';
import * as React from 'react';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const navigate = useNavigate();
	const userInfoData = localStorage.getItem('userInfo');
	const userInfo = userInfoData && JSON.parse(userInfoData);
	//流程、分组
	const data: Record<string, any> = {
		user: {
			name: userInfo?.username || '用户未登录',
			email: userInfo?.email || 'user@example.com',
			avatar: userInfo?.avatar || '/avatars/shadcn.jpg'
		},
		teams: [
			{
				name: 'prisma-ai',
				logo: Pyramid,
				plan: '从简历到offer'
			}
		],
		navMain: [
			// {
			// 	title: '首页',
			// 	url: '/main/home',
			// 	icon: House
			// },
			{
				title: '我的面经',
				icon: BookKey,
				iconClassName: 'text-[rgb(86,145,225)]',
				url: '/main/interview-summary/mine',
				groupLabel: '面经'
			},
			{
				title: '面经市场',
				icon: LibraryBig,
				iconClassName: 'text-[rgb(86,145,225)]',
				url: '/main/interview-summary/market'
			},
			{
				title: '我的面试题',
				icon: Target,
				iconClassName: 'text-[rgb(44,162,190)]',
				url: '/main/interview-question/mine',
				groupLabel: '面试题'
			},
			{
				title: '高频面试题',
				icon: Rocket,
				iconClassName: 'text-[rgb(44,162,190)]',
				url: '/main/interview-question/hot'
			},
			{
				title: 'Anki 同步',
				icon: Book,
				iconClassName: 'text-[rgb(44,162,190)]',
				url: '/main/interview-summary/anki'
			},
			{
				title: 'Prisma',
				icon: Bot,
				iconClassName: 'text-[rgb(116,100,144)]',
				url: '/main/aichat',
				groupLabel: 'AI'
			},
			{
				title: 'Apikey 配置',
				icon: KeyRound,
				iconClassName: 'text-[rgb(116,100,144)]',
				url: '/main/model-config'
			}
			// {
			// 	title: '来自 PrismaAI',
			// 	icon: Rocket,
			// 	url: '/main/offer',
			// 	isOpen: false,
			// 	items: [
			// 		{
			// 			title: '介绍',
			// 			url: '/main/offer/anki'
			// 		},
			// 		{ title: '传送门', url: '/main/offer/questions' }
			// 	]
			// }
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '#',
				icon: Settings
			},

			{
				title: 'Search',
				url: '#',
				icon: Search
			}
		]
	};
	if (userInfo?.role === 'admin') {
		data.navMain.push({
			title: '管理后台',
			icon: MonitorCog,
			iconClassName: 'text-[rgb(116,100,144)]',
			url: '/main/manage',
			isOpen: true,
			groupLabel: '管理员',
			items: [
				{
					title: '面经管理',
					url: '/main/interview-summary/action'
				},
				{
					title: '用户管理',
					url: '/main/manage/user'
				},
				{
					title: '服务管理',
					url: '/main/manage/service'
				},
				{
					title: '通知管理',
					url: '/main/manage/notification'
				}
			]
		});
	}
	// const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
	const { isMobile, toggleSidebar } = useSidebar();
	const [selectedGroupIndex, setSelectedGroupIndex] = React.useState(0);
	const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

	//挂载时，从当前URL确定selectedGroupIndex、selectedItemIndex
	React.useEffect(() => {
		const currentPath = window.location.pathname;
		let found = false;
		data.navMain.forEach((group: any, groupIdx: number) => {
			if (group.items) {
				group.items.forEach((item: any, itemIdx: number) => {
					if (item.url === currentPath) {
						setSelectedGroupIndex(groupIdx);
						setSelectedItemIndex(itemIdx);
						found = true;
						return;
					}
				});
			} else if (group.url === currentPath) {
				setSelectedGroupIndex(groupIdx);
				setSelectedItemIndex(-1); // 没有子项，直接选中主项
				found = true;
				return;
			}
		});

		//如果当前URL没有匹配到任何项，则默认打开则打开第一组
		if (!found) {
			const g = data.navMain[0];
			if (g) {
				if (g.items && g.items.length > 0) {
					setSelectedGroupIndex(0);
					setSelectedItemIndex(0);
				} else {
					setSelectedGroupIndex(0);
					setSelectedItemIndex(-1);
				}
			}
		}
	}, []);

	const handleNavItemClick = (groupIndex: number, itemIndex: number, url: string) => {
		setSelectedGroupIndex(groupIndex);
		setSelectedItemIndex(itemIndex);
		navigate(url);
		//如果是移动端，点击后关闭侧边栏
		if (isMobile) {
			toggleSidebar();
		}
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					items={data.navMain}
					selectedGroupIndex={selectedGroupIndex}
					selectedItemIndex={selectedItemIndex}
					onItemClick={handleNavItemClick}
				/>
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
