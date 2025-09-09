'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from '@/components/ui/sidebar';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { ThemeSwitcher } from '../ThemeSwitcher';

export function NavUser({
	user
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}) {
	const navigate = useNavigate();
	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('userInfo');
		navigate('/login');
		toast.success('退出登录成功');
	};
	const { isMobile } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem className="flex items-center gap-2">
				<SidebarMenuButton size="lg" className={cn('mb-3 hover:bg-transparent')}>
					<ThemeSwitcher className="bg-zinc-100 dark:bg-zinc-500/20! text-zinc-700 hover:text-zinc-100 dark:text-zinc-300"></ThemeSwitcher>
					<Badge
						variant="outline"
						className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 "
					>
						{import.meta.env.VITE_APP_VERSION || 'v1.0.0-beta.22'}
					</Badge>
				</SidebarMenuButton>
			</SidebarMenuItem>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-lg">CN</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						{/* <DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup> */}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => logout()}>
							<LogOut />
							退出登录
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
