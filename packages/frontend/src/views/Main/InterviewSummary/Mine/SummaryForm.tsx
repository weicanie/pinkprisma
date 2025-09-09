import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiKeyLsApi } from '@/services/apikey/apikey_ls';
import type { InterviewSummaryCreateDto } from '@prisma-ai/shared';
import {
    APIProvider,
    company_scale_list,
    copyright_type,
    interview_type_list,
    interviewSummaryCreateDtoSchema,
    job_type_list,
    turn_list
} from '@prisma-ai/shared';
import { Bot, CirclePlus, FileText } from 'lucide-react';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
    selectInterviewSummaryApiType,
    selectInterviewSummaryLLM
} from '../../../../store/InterviewSummary';
import ClickCollapsible from '../../components/ClickCollapsible';

type SummaryFormData = z.infer<typeof interviewSummaryCreateDtoSchema>;

interface SummaryFormProps {
	onSubmit: (data: InterviewSummaryCreateDto) => void;
	// onFinish: () => void;
	isLoading: boolean;
	setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

const SummaryForm: React.FC<SummaryFormProps> = memo(({ onSubmit, isLoading, setIsFinished }) => {
	const form = useForm<SummaryFormData>({
		resolver: zodResolver(interviewSummaryCreateDtoSchema),
		defaultValues: {
			//全部注册为受控字段，避免出现非受控到受控的模式转换问题
			content: '',
			own: false,
			copyright_type: copyright_type.origin,
			job_type: undefined,
			interview_type: undefined,
			company_scale: undefined,
			turn: undefined,
			post_link: undefined,
			company_name: undefined,
			job_name: undefined,
			job_link: undefined
		}
	});

	const apiType = useSelector(selectInterviewSummaryApiType);
	const model = useSelector(selectInterviewSummaryLLM);
	const handleSubmit = async (data: SummaryFormData) => {
		// 从LS中获取用户apikey
		const keyEntity = await apiKeyLsApi.getApiKeyByProvider(apiType as APIProvider);

		if (!keyEntity || !keyEntity.data?.apiKey) {
			toast.error(`请先在“API密钥管理”页面设置 ${apiType} 的API密钥。`);
			return;
		}

		console.log('提交的面经数据:', data);
		onSubmit({
			...data,
			modelConfig: { api_type: apiType, llm_type: model, apiKey: keyEntity.data.apiKey }
		} as InterviewSummaryCreateDto);
		setIsFinished(false);
	};

	return (
		<div className="w-full sm:min-w-xl max-w-2xl mt-7">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<FileText className="w-5 h-5" />
								<h3 className="text-xl">面经信息</h3>
							</div>

							<div className="flex justify-end">
								<Button type="submit" className="flex items-center text-md" disabled={isLoading}>
									{isLoading ? (
										<>
											<svg
												className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											处理中...
										</>
									) : (
										<>
											<CirclePlus className="size-5 mr-2" />
											创建面经
										</>
									)}
								</Button>
							</div>
						</div>

						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-lg mb-3">面经内容</FormLabel>
									<FormControl>
										<Textarea
											placeholder="请粘贴面经内容...可以一次粘贴多篇面经或者包含多场面试，AI 会自动进行拆分"
											{...field}
											rows={40}
											className="min-h-[150px] max-h-[250px] overflow-y-auto scb-thin"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="own"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center gap-2 mt-3 mb-3 font-semibold">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className="size-5 border-gray-500 border-2"
											/>
										</FormControl>
										<FormLabel className="mb-0 ">是自己的面经</FormLabel>
										<span className="text-xs text-gray-500">面试是不是您自己参加的</span>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="copyright_type"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base  mb-3">版权类型</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											value={field.value}
											className="flex flex-row items-center gap-6"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value={copyright_type.origin} id="origin" />
												<FormLabel htmlFor="origin" className="mb-0 cursor-pointer">
													原创
												</FormLabel>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value={copyright_type.reprint} id="reprint" />
												<FormLabel htmlFor="reprint" className="mb-0 cursor-pointer">
													转载
												</FormLabel>
												<span className="text-xs text-orange-600 font-semibold">
													转载前请先获授权
												</span>
											</div>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<ClickCollapsible
							defaultOpen={false}
							title="以下信息可由AI自动补全"
							icon={<Bot className="size-5" />}
						>
							<FormField
								control={form.control}
								name="post_link"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="mt-3 mb-3">原文链接（可选）</FormLabel>
										<FormControl>
											<Input placeholder="请输入原文链接" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="job_link"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="mt-3 mb-3">职位链接（可选）</FormLabel>
										<FormControl>
											<Input placeholder="请输入职位链接" {...field} />
										</FormControl>
										<FormDescription className="mt-3 mb-3 font-semibold">
											以下字段"面经内容"中已有的不用写，AI 会进行根据内容进行补全：
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="job_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mt-3 mb-3">岗位类型（可选）</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="选择岗位类型" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{job_type_list.map((type: string) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="job_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mt-3 mb-3">职位名称（可选）</FormLabel>
											<FormControl>
												<Input placeholder="请输入职位名称" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="company_scale"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mt-3 mb-3">公司规模（可选）</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="选择公司规模" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{company_scale_list.map((scale: string) => (
														<SelectItem key={scale} value={scale}>
															{scale}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="company_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mt-3 mb-3">公司名称（可选）</FormLabel>
											<FormControl>
												<Input placeholder="请输入公司名称" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="interview_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mt-3 mb-3">面试类型（可选）</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="选择面试类型" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{interview_type_list.map((type: string) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="turn"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mt-3 mb-3">面试轮次（可选）</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="选择面试轮次" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{turn_list.map((turn: string) => (
														<SelectItem key={turn} value={turn}>
															{turn}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</ClickCollapsible>
					</div>
				</form>
			</Form>
		</div>
	);
});

export default SummaryForm;
