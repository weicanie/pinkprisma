import { Moon, Sun } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../../utils/theme';

interface ThemeSwitcherProps {
	className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
	const { resolvedTheme, setTheme } = useTheme();

	const themeList = ['light', 'dark'];
	const [themeIdx, setThemeIDx] = useState(themeList.indexOf(resolvedTheme));

	const clickHandler = () => {
		setThemeIDx((themeIdx + 1) % themeList.length);
		const newTheme = themeList[(themeIdx + 1) % themeList.length];
		setTheme(newTheme as 'light' | 'dark');
		document.documentElement.setAttribute('class', newTheme); //tailwind样式消费
	};

	const iconMap = {
		light: <Sun aria-hidden="true" className="size-4" />,
		dark: <Moon aria-hidden="true" className="size-4" />
	};

	return (
		<div
			className={cn(
				'rounded-full bg-[var(--sidebar-primary)] p-2 text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600  transition-colors cursor-pointer',
				'group-data-[state=collapsed]:bg-transparent',
				className
			)}
			onClick={clickHandler}
		>
			{iconMap[resolvedTheme]}
		</div>
	);
};
