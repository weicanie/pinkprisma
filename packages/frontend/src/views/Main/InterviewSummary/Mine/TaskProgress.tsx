import { Progress } from '@/components/ui/progress';
import { TaskStatus } from '@prisma-ai/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CircleX, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { InterviewSummaryQueryKey, TaskQueueQueryKey } from '../../../../query/keys';
import { getTaskProgress } from '../../../../services/InterviewSummary';
import { Button } from '../../../Saas/components/c-cpns/Button';

interface TaskProgressProps {
	taskId: string;
	isFinished: boolean;
	setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
	setTaskIds: React.Dispatch<React.SetStateAction<string[]>>; //用于切分后被第一篇面经复用的原处理任务传递其余任务的id
	onFinish: (taskId: string) => void;
}

const TaskProgress = ({
	taskId,
	isFinished,
	setIsFinished,
	setTaskIds,
	onFinish
}: TaskProgressProps) => {
	const queryClient = useQueryClient();

	const { data: taskData } = useQuery({
		queryKey: [TaskQueueQueryKey.Detail, taskId],
		queryFn: () => getTaskProgress(taskId!),
		enabled: !!taskId,
		refetchInterval: query => {
			const task = query.state.data?.data;
			if (task?.status === 'completed' || task?.status === 'failed') {
				if (task?.status === 'completed') {
					toast.success('面经处理完成');
					queryClient.invalidateQueries({ queryKey: [InterviewSummaryQueryKey.All] });
					setIsFinished(true);
				} else {
					toast.error('面经处理失败', {
						description: task.error
					});
					setIsFinished(true);
				}
				return false;
			}
			return 2000;
		}
	});

	const task = taskData?.data;
	const progress = task?.progressNum;
	const results = task?.result || [];

	// 获取切分出的其余任务Id
	const taskIdsMessage = task?.result?.find(item =>
		item.message.startsWith('其余任务Id：')
	)?.message;
	const taskIds = taskIdsMessage ? JSON.parse(taskIdsMessage.split('：')[1]) : [];

	useEffect(() => {
		setTaskIds(prev => [...prev, ...taskIds]);
	}, [taskIds.length]);

	// 获取已完成的步骤
	const completedSteps = results.filter(item => item.status === TaskStatus.COMPLETED);
	// 获取当前正在处理的步骤（最后一个result的message）
	const currentStep = results.length > 0 ? results[results.length - 1] : null;
	//展示当前的最后一步
	let lastStep = null;
	switch (task?.status) {
		case TaskStatus.COMPLETED:
			lastStep = (
				<div className="flex items-center text-green-600">
					<CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
					<span>{currentStep?.message}</span>
				</div>
			);
			break;
		case TaskStatus.FAILED:
			lastStep = (
				<div className="flex items-center text-red-600">
					<CircleX className="w-4 h-4 mr-2 shrink-0" />
					<span>{currentStep?.message}</span>
				</div>
			);
			break;
		case TaskStatus.RUNNING:
		case TaskStatus.PENDING:
			lastStep = (
				<div className="flex items-center text-blue-600">
					<Loader2 className="w-4 h-4 mr-2 shrink-0 animate-spin" />
					<span>{currentStep?.message}</span>
				</div>
			);
			break;
		default:
			lastStep = null;
			break;
	}

	return (
		<>
			{taskId && progress !== undefined && (
				<div className="w-full grid gap-4 py-4">
					<Progress value={progress} />
					<p>处理中，请稍候...{progress}%</p>
					<div className="grid gap-3 text-sm">
						{/* 显示已完成的步骤 */}
						{completedSteps.map((item, index) => (
							<div key={index} className="flex items-center text-green-600">
								<CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
								<span>{item.name}</span>
							</div>
						))}
						{lastStep}
					</div>
				</div>
			)}
			{isFinished && (
				<Button variant="outline" onClick={() => onFinish(taskId)} className="dark:text-white">
					完成
				</Button>
			)}
		</>
	);
};

export default TaskProgress;
