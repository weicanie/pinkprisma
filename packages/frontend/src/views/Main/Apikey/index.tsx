import { useCustomMutation, useCustomQuery } from '@/query/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

import { ApiKeyQueryKey } from '@/query/keys';
import { apiKeyLsApi } from '@/services/apikey/apikey_ls';
import type {
    ApiKeyResponseDto,
    SaveApiKeyDto,
    UpdateApiKeyDto
} from '@/services/apikey/apikey_ls.service';
import { APIProvider } from '@prisma-ai/shared';
import { PageHeader } from '../components/PageHeader';

// 表单数据类型
interface FormData {
	provider: string;
	apiKey: string;
	alias?: string;
}

// 表单验证模式
const formSchema = z.object({
	provider: z.string().min(1, '请选择API提供商'),
	apiKey: z.string().min(1, 'API密钥不能为空').min(10, 'API密钥长度至少为10个字符'),
	alias: z.string().optional()
});

/**
 * API密钥管理页面
 * 用户可以设置不同厂商的API密钥，并持久化到数据库
 */
const ModelConfig = () => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [currentApiKey, setCurrentApiKey] = useState<ApiKeyResponseDto | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKeyResponseDto | null>(null);

	const queryClient = useQueryClient();

	// 初始化表单
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			provider: APIProvider.kimi,
			alias: ''
		}
	});

	// 获取API密钥列表
	const { data: apiKeysData, isLoading: isLoadingKeys } = useCustomQuery(
		[ApiKeyQueryKey.List],
		() => apiKeyLsApi.getApiKeys()
	);
	const apiKeys = apiKeysData?.data || [];
	// 获取支持的提供商列表
	const { data: providersData, isLoading: isLoadingProviders } = useCustomQuery(
		[ApiKeyQueryKey.Providers],
		() => apiKeyLsApi.getSupportedProviders()
	);
	const providers = providersData?.data || [];

	// 保存API密钥
	const saveApiKeyMutation = useCustomMutation(
		(data: SaveApiKeyDto) => apiKeyLsApi.saveApiKey(data),
		{
			onSuccess: () => {
				toast.success('API密钥已保存在本地');
				queryClient.invalidateQueries({ queryKey: [ApiKeyQueryKey.List] });
				closeDialog();
			}
		}
	);

	// 更新API密钥
	const updateApiKeyMutation = useCustomMutation(
		({ id, data }: { id: string; data: UpdateApiKeyDto }) => apiKeyLsApi.updateApiKey(id, data),
		{
			onSuccess: () => {
				toast.success('API密钥更新成功');
				queryClient.invalidateQueries({ queryKey: [ApiKeyQueryKey.List] });
				closeDialog();
			}
		}
	);

	// 删除API密钥
	const deleteApiKeyMutation = useCustomMutation((id: string) => apiKeyLsApi.deleteApiKey(id), {
		onSuccess: () => {
			toast.success('API密钥已从本地删除');
			queryClient.invalidateQueries({ queryKey: [ApiKeyQueryKey.List] });
			setDeleteDialogOpen(false);
			setApiKeyToDelete(null);
		}
	});

	/**
	 * 打开新增弹窗
	 */
	const openAddDialog = () => {
		setCurrentApiKey(null);
		setIsEditing(false);
		form.reset({ provider: APIProvider.kimi, apiKey: '', alias: '' });
		setIsDialogOpen(true);
	};

	/**
	 * 打开编辑弹窗
	 */
	const openEditDialog = (apiKey: ApiKeyResponseDto) => {
		setCurrentApiKey(apiKey);
		setIsEditing(true);
		form.reset({
			provider: apiKey.provider,
			apiKey: '', // 不显示现有密钥
			alias: apiKey.alias || ''
		});
		setIsDialogOpen(true);
	};

	/**
	 * 打开删除确认弹窗
	 */
	const openDeleteDialog = (apiKey: ApiKeyResponseDto) => {
		setApiKeyToDelete(apiKey);
		setDeleteDialogOpen(true);
	};

	/**
	 * 确认删除API密钥
	 */
	const handleDeleteConfirm = () => {
		if (apiKeyToDelete) {
			deleteApiKeyMutation.mutate(apiKeyToDelete.id);
		}
	};

	/**
	 * 表单提交处理
	 */
	const onSubmit = async (data: FormData) => {
		if (isEditing && currentApiKey) {
			// 更新现有API密钥
			const updateData: UpdateApiKeyDto = {
				alias: data.alias
			};
			// 只有在输入了新密钥时才更新
			if (data.apiKey.trim()) {
				updateData.apiKey = data.apiKey;
			}
			updateApiKeyMutation.mutate({ id: currentApiKey.id, data: updateData });
		} else {
			// 创建新API密钥
			const saveData: SaveApiKeyDto = {
				provider: data.provider as APIProvider,
				apiKey: data.apiKey,
				alias: data.alias
			};
			saveApiKeyMutation.mutate(saveData);
		}
	};

	/**
	 * 关闭弹窗
	 */
	const closeDialog = () => {
		setIsDialogOpen(false);
		setCurrentApiKey(null);
		setIsEditing(false);
		form.reset({ provider: APIProvider.kimi, apiKey: '', alias: '' });
	};

	const isLoading =
		saveApiKeyMutation.isPending ||
		updateApiKeyMutation.isPending ||
		deleteApiKeyMutation.isPending;

	return (
		<div>
			<PageHeader
				title="API密钥管理"
				description="管理您的AI模型API密钥，配置将安全保存在您的浏览器本地存储中，不会上传到服务器。"
			/>

			<div className="p-8 max-w-6xl mx-auto space-y-6">
				{/* API密钥管理表格 */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>API密钥配置</CardTitle>
							<CardDescription>设置不同厂商的API密钥，用于访问AI模型服务。</CardDescription>
						</div>
						<Button onClick={openAddDialog}>添加API密钥</Button>
					</CardHeader>
					<CardContent>
						{isLoadingKeys ? (
							<div className="text-center py-8">加载中...</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="font-semibold">提供商</TableHead>
										<TableHead className="font-semibold">名称</TableHead>
										<TableHead className="font-semibold">创建时间</TableHead>
										<TableHead className="font-semibold">操作</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{apiKeys.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
												暂无API密钥，点击"添加API密钥"开始配置
											</TableCell>
										</TableRow>
									) : (
										apiKeys.map(apiKey => (
											<TableRow key={apiKey.id}>
												<TableCell>
													<div className="font-medium">{apiKey.provider}</div>
												</TableCell>
												<TableCell>{apiKey.alias || '-'}</TableCell>
												<TableCell>{new Date(apiKey.create_at).toLocaleDateString()}</TableCell>
												<TableCell className="text-right">
													<div className="flex gap-2 justify-start">
														<Button
															variant="outline"
															size="sm"
															onClick={() => openEditDialog(apiKey)}
														>
															<Settings className="h-4 w-4 mr-1" />
															编辑
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => openDeleteDialog(apiKey)}
															className="text-red-700 hover:text-red-800 hover:bg-red-50"
														>
															<Trash2 className="h-4 w-4 mr-1" />
															删除
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* 添加/编辑弹窗 */}
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{isEditing ? '编辑API密钥' : '添加API密钥'}</DialogTitle>
							<DialogDescription>
								{isEditing
									? '更新您的API密钥信息。密钥将保存在您的浏览器本地。'
									: '请输入您的API密钥信息。密钥将保存在您的浏览器本地。'}
							</DialogDescription>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								{!isEditing && (
									<FormField
										control={form.control}
										name="provider"
										render={({ field }) => (
											<FormItem>
												<FormLabel>API提供商</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="请选择API提供商" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{isLoadingProviders ? (
															<SelectItem value="" disabled>
																加载中...
															</SelectItem>
														) : (
															providers?.map(provider => (
																<SelectItem key={provider.key} value={provider.key}>
																	{provider.name}
																</SelectItem>
															))
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
								<FormField
									control={form.control}
									name="apiKey"
									render={({ field }) => (
										<FormItem>
											<FormLabel>API密钥</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder={isEditing ? '输入新的API密钥' : '请输入API密钥'}
													{...field}
													className="font-mono"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="alias"
									render={({ field }) => (
										<FormItem>
											<FormLabel>名称 (可选)</FormLabel>
											<FormControl>
												<Input placeholder="为此API密钥设置一个别名" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={closeDialog}
										disabled={isLoading}
									>
										取消
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading ? '保存中...' : '保存'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* 删除确认弹窗 */}
				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>确认删除</AlertDialogTitle>
							您确定要删除这个API密钥吗？
							{apiKeyToDelete && (
								<div className="mt-2 p-2 text-gray-300">
									<div>
										<strong>提供商:</strong> {apiKeyToDelete.provider}
									</div>
									{apiKeyToDelete.alias && (
										<div>
											<strong>名称:</strong> {apiKeyToDelete.alias}
										</div>
									)}
								</div>
							)}
							<div className="mt-2 text-red-700">此操作无法撤销，删除后将无法恢复。</div>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleteApiKeyMutation.isPending}>取消</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteConfirm}
								disabled={deleteApiKeyMutation.isPending}
								className="bg-red-700 hover:bg-red-800"
							>
								{deleteApiKeyMutation.isPending ? '删除中...' : '确认删除'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* 使用说明 */}
				<Card>
					<CardHeader>
						<CardTitle>使用说明</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* <div>
							<h4 className="font-medium mb-2">DeepSeek API</h4>
							<p className="text-sm text-muted-foreground">
								访问{' '}
								<a
									href="https://platform.deepseek.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									DeepSeek 平台
								</a>{' '}
								获取您的API密钥。DeepSeek 官方。
							</p>
						</div> */}
						<div>
							<h4 className="font-medium mb-2">千问 API</h4>
							<p className="text-sm text-muted-foreground">
								访问{' '}
								<a
									href="https://bailian.console.aliyun.com/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									千问平台
								</a>{' '}
								获取您的 API 密钥。阿里云官方。每个模型赠送100万免费token。
							</p>
						</div>
						<div>
							<h4 className="font-medium mb-2">智谱 API</h4>
							<p className="text-sm text-muted-foreground">
								访问{' '}
								<a
									href="https://bigmodel.cn/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									智谱平台
								</a>{' '}
								获取您的 API 密钥。智谱官方。赠送大量免费token。
							</p>
						</div>
						<div>
							<h4 className="font-medium mb-2">Kimi API</h4>
							<p className="text-sm text-muted-foreground">
								访问{' '}
								<a
									href="https://platform.moonshot.cn/console/account"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									Kimi平台
								</a>{' '}
								获取您的 API 密钥。Kimi 官方。
							</p>
						</div>
						<div>
							<h4 className="font-medium mb-2">国内代理 API</h4>
							<p className="text-sm text-muted-foreground">
								{' '}
								访问{' '}
								<a
									href="https://api.chatanywhere.tech/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									国内代理平台
								</a>{' '}
								获取您的 API 密钥。国内代理服务，支持多种模型。第三方平台，风险自负。
							</p>
						</div>
						<div>
							<h4 className="font-medium mb-2">安全说明</h4>
							<p className="text-sm text-muted-foreground">
								您的 API
								密钥将安全地仅存储在您浏览器的本地存储空间中，且只会在您使用时安全传输到所属的第三方
								API。
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ModelConfig;
