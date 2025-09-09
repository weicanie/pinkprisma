import { ChevronRight, CirclePlus, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarSeparator
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { cn } from '../../../../lib/utils';
import Notice from '../Notice';

type NavMainProps = {
	items: {
		title: string;
		url?: string;
		icon?: LucideIcon;
		iconClassName?: string;
		isOpen?: boolean; // 是否默认展开
		groupLabel?: string;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
	selectedGroupIndex: number; // 当前选中的组索引
	selectedItemIndex: number;
	onItemClick: (groupIndex: number, itemIndex: number, url: string) => void;
};

export function NavMain({
	items,
	selectedGroupIndex,
	selectedItemIndex,
	onItemClick
}: NavMainProps) {
	const navigate = useNavigate();

	// 处理创建面经按钮点击
	const handleCreateInterviewClick = () => {
		// 先导航到面经页面
		navigate('/main/interview-summary/mine');

		// 递归检测按钮是否已渲染完毕
		const checkAndClickButton = (retryCount = 0, maxRetries = 20) => {
			const createBtn = document.getElementById('create-interview-dialog-btn');

			if (createBtn) {
				// 按钮已渲染，触发点击
				createBtn.click();
			} else if (retryCount < maxRetries) {
				// 按钮未渲染，继续等待并重试
				setTimeout(() => {
					checkAndClickButton(retryCount + 1, maxRetries);
				}, 50); // 每50ms检测一次
			} else {
				// 超过最大重试次数，输出警告
				console.warn('创建面经按钮未找到，可能页面渲染异常');
			}
		};

		// 开始检测
		checkAndClickButton();
	};

	return (
		<SidebarGroup className="space-y-5">
			<SidebarMenu>
				<SidebarMenuItem className="flex items-center gap-2">
					<SidebarMenuButton
						tooltip="创建面经"
						className={cn(
							'flex justify-between bg-primary  font-semibold text-white hover:text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-8',
							'group-data-[state=collapsed]:text-zinc-700 dark:group-data-[state=collapsed]:text-zinc-300',
							'group-data-[state=collapsed]:bg-transparent'
						)}
						onClick={handleCreateInterviewClick}
					>
						<CirclePlus />
						<span className="relative right-[50%] translate-x-[50%]">创建面经</span>
					</SidebarMenuButton>
					<Notice />
				</SidebarMenuItem>
			</SidebarMenu>

			<SidebarMenu className="space-y-2">
				{items.map((item, groupIdx) => {
					//主项是否被选中：当没有子项时,选中的组选中主项
					const isMainItemActive =
						selectedGroupIndex === groupIdx &&
						(selectedItemIndex === -1 || !item.items || item.items.length === 0);

					if (!item.items || item.items.length === 0) {
						//如果没有子项，渲染为无折叠的菜单项
						return (
							<Fragment key={item.title}>
								{item.groupLabel && (
									<SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
										{item.groupLabel}
									</SidebarGroupLabel>
								)}
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										// asChild
										// asChild属性会透传props给子组件,然后渲染子组件而非原组件
										tooltip={item.title}
										isActive={isMainItemActive}
										onClick={() => item.url && onItemClick(groupIdx, -1, item.url)}
										className="cursor-pointer"
									>
										{item.icon && (
											<item.icon
												className={cn(
													item.iconClassName,
													'dark:group-data-[state=collapsed]:text-zinc-300',
													'group-data-[state=collapsed]:text-zinc-700'
												)}
											/>
										)}
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</Fragment>
						);
					}

					//如果有子项，渲染为可折叠的菜单项
					return (
						<Fragment key={item.title}>
							{item.groupLabel ? (
								<SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
									{item.groupLabel}
								</SidebarGroupLabel>
							) : (
								<SidebarSeparator />
							)}
							<Collapsible
								key={item.title}
								asChild
								defaultOpen={item.isOpen || selectedGroupIndex === groupIdx}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip={item.title}
											isActive={isMainItemActive}
											className="cursor-pointer"
										>
											{item.icon && (
												<item.icon
													className={cn(
														item.iconClassName,
														//group：Sidebar
														//group/collapsible: Collapsible
														'group-data-[state=closed]/collapsible:text-zinc-700 dark:group-data-[state=closed]/collapsible:text-zinc-300',
														'group-data-[state=collapsed]:text-zinc-700 dark:group-data-[state=collapsed]:text-zinc-300'
													)}
												/>
											)}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem, subIdx) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton
														asChild
														isActive={
															selectedGroupIndex === groupIdx && selectedItemIndex === subIdx
														}
														onClick={() => onItemClick(groupIdx, subIdx, subItem.url)}
														className="cursor-pointer"
													>
														<span>{subItem.title}</span>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						</Fragment>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
