import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InterviewQuestion, UpdateQuestionDto } from '@prisma-ai/shared';
import { BookCheck, Map, PenLine, Text } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { updateQuestion } from '../../../services/question';
import ClickCollapsible from './ClickCollapsible';
import MilkdownEditor from './Editor';
const MarkdownEditor = React.lazy(() => import('./Editor_react_markdown'));
const MarkmapHooks = React.lazy(() => import('./Markmap/markmap-hooks'));

interface QuestionEditProps {
	question: Omit<InterviewQuestion, 'own'>;
	onSuccess?: () => void; // 更新成功后的回调函数
	className?: string;
}

/**
 * 面试题编辑组件
 * 包含一个icon按钮，点击后弹出编辑弹窗
 */
const QuestionEdit: React.FC<QuestionEditProps> = ({ question, onSuccess, className }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [showAnswer, setShowAnswer] = useState(false);
	const [showMindmap, setShowMindmap] = useState(false);

	// 表单数据状态
	const [formData, setFormData] = useState<UpdateQuestionDto>({
		articleId: question.id,
		title: question.title || '',
		content: question.content || '',
		gist: question.gist || '',
		content_mindmap: question.content_mindmap || '',
		version: question.version || '',
		change_log: question.change_log || '',
		content_type: question.content_type || '',
		job_type: question.job_type || '',
		hard: question.hard || ''
	});

	// 当question变化时，更新表单数据
	useEffect(() => {
		setFormData({
			articleId: question.id,
			title: question.title || '',
			content: question.content || '',
			gist: question.gist || '',
			content_mindmap: question.content_mindmap || '',
			version: question.version || '',
			change_log: question.change_log || '',
			content_type: question.content_type || '',
			job_type: question.job_type || '',
			hard: question.hard || ''
		});
	}, [question]);

	// 处理表单字段变化
	const handleInputChange = (field: keyof UpdateQuestionDto, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	// 提交表单
	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			await updateQuestion(formData);
			toast.success('面试题更新成功');
			setIsOpen(false);
			onSuccess?.(); // 调用成功回调
		} catch (error: any) {
			toast.error(error.message || '更新失败');
		} finally {
			setIsLoading(false);
		}
	};

	// 渲染面试题预览组件（复用SummaryRead中的渲染逻辑）
	const renderQuestionPreview = () => {
		const previewQuestion = {
			...question,
			...formData
		};

		return (
			<div className="space-y-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<Text className="size-5" />
							{previewQuestion.title || '暂无标题'}
						</CardTitle>
						<CardDescription>
							<div className="flex items-center gap-4 text-xs text-gray-500">
								<Badge variant="outline">难度: {previewQuestion.hard || '未知'}</Badge>
								<Badge variant="outline">版本: {previewQuestion.version || '未知'}</Badge>
								<Badge variant="outline">类型: {previewQuestion.content_type || '未知'}</Badge>
							</div>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* 答案部分 */}
						<ClickCollapsible
							title={<span className="text-base">答案</span>}
							icon={<BookCheck className="size-5" />}
							onClick={() => setShowAnswer(!showAnswer)}
							defaultOpen={showAnswer}
						>
							<Suspense fallback={<div>加载编辑器...</div>}>
								{isOpen && showAnswer && (
									<MarkdownEditor
										initialValue={previewQuestion.content || '暂无答案'}
										isReadOnly={true}
										isEditFallback={true}
									/>
								)}
							</Suspense>
						</ClickCollapsible>

						{/* 导图总结部分 */}
						<ClickCollapsible
							title={<span className="text-base">导图总结</span>}
							icon={<Map className="size-5" />}
							defaultOpen={showMindmap}
							onClick={() => setShowMindmap(!showMindmap)}
						>
							<Suspense fallback={<div>加载导图...</div>}>
								{isOpen && showMindmap && (
									<MarkmapHooks
										text={
											previewQuestion.content_mindmap
												?.replace(/\\n/g, '\n')
												.replace(/\\t/g, '\t')
												.replace(/\\r/g, '\r')
												.replace(/\\\\/g, '\\')
												.replace(/\\"/g, '"')
												.replace(/\\'/g, "'") || '暂无导图总结'
										}
										isEditFallback={true}
									/>
								)}
							</Suspense>
						</ClickCollapsible>

						{/* 要点部分 */}
						<ClickCollapsible
							title={<span className="text-base">要点</span>}
							icon={<Text className="size-5" />}
							defaultOpen={true}
						>
							<Suspense fallback={<div>加载编辑器...</div>}>
								{isOpen && (
									<MilkdownEditor isShwoMode={true} text={previewQuestion.gist || '暂无要点'} />
								)}
							</Suspense>
						</ClickCollapsible>
					</CardContent>
				</Card>
			</div>
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<div className={cn('size-5', className)} onClick={e => e.stopPropagation()}>
					<PenLine className="size-full" />
				</div>
			</DialogTrigger>
			<DialogContent
				className="md:max-w-[90vw]! max-h-[90vh] overflow-y-auto scb-thin"
				// 阻止点击事件冒泡到外部组件
				onClick={e => {
					e.stopPropagation();
				}}
			>
				<DialogHeader>
					<DialogTitle>编辑面试题</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-6">
					{/* 左侧表单 */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">标题</Label>
							<Input
								id="title"
								value={formData.title || ''}
								onChange={e => handleInputChange('title', e.target.value)}
								placeholder="请输入面试题标题"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="content_type">内容类型</Label>
							<Input
								id="content_type"
								value={formData.content_type || ''}
								onChange={e => handleInputChange('content_type', e.target.value)}
								placeholder="如：JavaScript、CSS、算法等"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="job_type">职位类型</Label>
							<Input
								id="job_type"
								value={formData.job_type || ''}
								onChange={e => handleInputChange('job_type', e.target.value)}
								placeholder="如：前端、后端、全栈等"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="hard">难度</Label>
							<Input
								id="hard"
								value={formData.hard || ''}
								onChange={e => handleInputChange('hard', e.target.value)}
								placeholder="如：1、2、2.5、3等"
							/>
						</div>

						<div className="space-y-2">
							<ClickCollapsible
								title={<Label htmlFor="content">答案内容</Label>}
								icon={<Text className="size-5" />}
								defaultOpen={false}
							>
								<Textarea
									id="content"
									value={formData.content || ''}
									onChange={e => handleInputChange('content', e.target.value)}
									placeholder="请输入面试题答案内容"
									className="min-h-[120px] resize-none"
								/>
							</ClickCollapsible>
						</div>

						<div className="space-y-2">
							<ClickCollapsible
								title={<Label htmlFor="content_mindmap">导图内容</Label>}
								icon={<Text className="size-5" />}
								defaultOpen={false}
							>
								<Textarea
									id="content_mindmap"
									value={formData.content_mindmap || ''}
									onChange={e => handleInputChange('content_mindmap', e.target.value)}
									placeholder="请输入思维导图内容（Markdown格式）"
									className="min-h-[100px] resize-none"
								/>
							</ClickCollapsible>
						</div>

						<div className="space-y-2">
							<Label htmlFor="gist">要点总结</Label>
							<Textarea
								id="gist"
								value={formData.gist || ''}
								onChange={e => handleInputChange('gist', e.target.value)}
								placeholder="请输入要点总结"
								className="min-h-[100px] resize-none"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="version">版本</Label>
							<Input
								id="version"
								value={formData.version || ''}
								onChange={e => handleInputChange('version', e.target.value)}
								placeholder="请输入版本号"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="change_log">变更日志</Label>
							<Textarea
								id="change_log"
								value={formData.change_log || ''}
								onChange={e => handleInputChange('change_log', e.target.value)}
								placeholder="请输入本次更新的变更说明"
								className="min-h-[80px] resize-none"
							/>
						</div>

						<div className="flex gap-2 pt-4">
							<Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
								{isLoading ? '更新中...' : '更新面试题'}
							</Button>
							<Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
								取消
							</Button>
						</div>
					</div>

					{/* 右侧预览 */}
					<div className="border-l pl-6">
						<h3 className="text-lg font-semibold mb-4">预览效果</h3>
						{renderQuestionPreview()}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default QuestionEdit;
