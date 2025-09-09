import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import type { PropsWithChildren } from 'react';
import { cn } from '../../../lib/utils';

type CreateBtnProps = PropsWithChildren<{
	title?: React.ReactNode;
	description?: string;
	children?: React.ReactNode;
	id?: string; // 添加可选的id属性
	className?: string;
}>;

export function CreateBtn(props: CreateBtnProps) {
	const { title, children, id, className } = props;
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="sm:ml-10 sm:flex-none">
					<button
						id={id} // 添加id属性
						type="button"
						className={cn(
							'block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
							className
						)}
					>
						{title}
					</button>
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-260! ">
				<DialogHeader className="border-b-1 ">
					<DialogTitle className="pb-5">{title}</DialogTitle>
					{/* <DialogDescription>{description}</DialogDescription> */}
				</DialogHeader>
				{/* 弹窗内容 */}
				{children}
			</DialogContent>
		</Dialog>
	);
}
