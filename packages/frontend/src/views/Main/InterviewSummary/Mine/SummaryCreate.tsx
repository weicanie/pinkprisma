import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { CirclePlus, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { cn } from '../../../../lib/utils';
import { useCustomMutation } from '../../../../query/config';
import { createInterviewSummary } from '../../../../services/InterviewSummary';
import {
	selectInterviewSummaryLLM,
	setInterviewSummaryLLM
} from '../../../../store/InterviewSummary';
import { ChangeLLM } from '../../components/ChangeLLM';
import SummaryForm from './SummaryForm';
import TaskProgress from './TaskProgress';

const SummaryCreate = () => {
	const [taskIds, setTaskIds] = useState<string[]>([]);
	const [isFinished, setIsFinished] = useState(false);
	const createMutation = useCustomMutation(createInterviewSummary, {
		onSuccess: data => {
			toast.success('面经处理任务创建成功，正在处理中...');
			setTaskIds(prev => [...prev, data.data.id]);
		}
	});

	const handleFinish = (taskId: string) => {
		setTaskIds(prev => prev.filter(id => id !== taskId));
	};

	const dialogContent = (
		<>
			{taskIds.length > 0 ? (
				<div className="">
					<>
						{taskIds.map(taskId => (
							<TaskProgress
								taskId={taskId}
								onFinish={handleFinish}
								isFinished={isFinished}
								setIsFinished={setIsFinished}
								setTaskIds={setTaskIds}
							/>
						))}
					</>
				</div>
			) : (
				<div className="w-full">
					<div className="flex justify-center items-center">
						<SummaryForm
							isLoading={createMutation.isPending}
							onSubmit={createMutation.mutate}
							setIsFinished={setIsFinished}
						/>
					</div>
				</div>
			)}
		</>
	);

	const isMobile = useIsMobile();
	const btnTitle = isMobile ? <CirclePlus></CirclePlus> : '创建面经';
	const btnTaskTitle = isMobile ? <Eye></Eye> : '查看任务进度';
	return (
		<div className={`flex items-center  ${isMobile ? 'gap-2' : ''}`}>
			<ChangeLLM
				selector={selectInterviewSummaryLLM}
				setModelAction={setInterviewSummaryLLM}
			></ChangeLLM>

			<Dialog>
				<DialogTrigger asChild>
					<div className="sm:ml-10 sm:flex-none">
						<button
							id="create-interview-dialog-btn" // 添加id属性
							type="button"
							className={cn(
								'block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
								isMobile ? 'flex items-center justify-center min-w-1 size-8 px-2 py-2' : 'min-w-25'
							)}
						>
							{taskIds.length > 0 ? btnTaskTitle : btnTitle}
						</button>
					</div>
				</DialogTrigger>
				<DialogContent className="max-w-260! max-h-[75vh]  sm:max-h-[90vh] overflow-auto scb-thin">
					<DialogHeader className="border-b-1 ">
						<DialogTitle className="pb-5">
							{taskIds.length > 0 ? btnTaskTitle : btnTitle}
						</DialogTitle>
					</DialogHeader>
					{/* 弹窗内容 */}
					{dialogContent}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SummaryCreate;
