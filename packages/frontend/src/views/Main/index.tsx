import { Separator } from '@/components/ui/separator';
import { BotMessageSquare } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { useTheme } from '../../utils/theme';
import AIChat from './aichat/AIChat';
import { BreadcrumbNav } from './components/Breadcrumb';
import { AppSidebar } from './components/Siderbar/app-sidebar';

// 自定义触发器
// function CustomTrigger() {
// const { toggleSidebar } = useSidebar();
// return <button onClick={toggleSidebar}>Toggle Sidebar</button>;
//}
function Main() {
	// 设置项，未实现设置功能
	const sidebarDefaultOpen = localStorage.getItem('sidebarDefaultOpen');
	localStorage.setItem('sidebarDefaultOpen', 'true');

	const [showAIChat, setShowAIChat] = useState(false);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<>
			<SidebarProvider
				//宽度设置方式
				// style={{
				// 	'--sidebar-width': '20rem',
				// 	'--sidebar-width-mobile': '20rem'
				// }}
				defaultOpen={sidebarDefaultOpen ? sidebarDefaultOpen === 'true' : true}
				//这两个属性会开启受控模式
				// onOpenChange={open => {
				// 	console.log('open!', open);
				// }}
				// open={open}
			>
				{/* 侧边栏 */}
				<AppSidebar variant="inset" />
				{/* 内容 */}
				<SidebarInset className="bg-global">
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4!" />
							<BreadcrumbNav></BreadcrumbNav>
						</div>
					</header>
					{/* 路由到的组件 */}
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
			{/* 打开Prisma对话界面的按钮 */}
			<Sheet>
				<SheetTrigger onClick={() => setShowAIChat(true)} className="fixed top-7 right-5">
					<div className="flex items-center gap-2 cursor-pointer">
						<BotMessageSquare className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`} />
						{/* <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
													{'问问 Prisma'}
												</span> */}
					</div>
				</SheetTrigger>
				{/* 通过设置更大的max-w（!）以设置宽度 */}
				<SheetContent
					id="ai-chat-sheet"
					className="w-[min(900px,80vw)]! max-w-1000! bg-global"
					side="right"
				>
					<Suspense fallback={<div>加载AI聊天...</div>}>
						{showAIChat && <AIChat className="h-full! pt-10 pb-5" />}
					</Suspense>
				</SheetContent>
			</Sheet>
		</>
	);
}

export default Main;
