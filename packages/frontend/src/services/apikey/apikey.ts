import type { ServerDataFormat as SDF } from '@prisma-ai/shared';
import { instance } from './config';

// API密钥响应DTO
export interface ApiKeyResponseDto {
	id: string;
	provider: string;
	alias?: string;
	create_at: string; // 修改为与后端一致的字段名
	update_at: string; // 修改为与后端一致的字段名
}

// 保存API密钥DTO
export interface SaveApiKeyDto {
	provider: string;
	apiKey: string;
	alias?: string;
}

// 更新API密钥DTO
export interface UpdateApiKeyDto {
	apiKey?: string;
	alias?: string;
}

// 查询API密钥DTO
export interface QueryApiKeyDto {
	provider?: string;
	isActive?: boolean;
}

// 提供商信息
export interface ProviderInfo {
	key: string;
	name: string;
	description: string;
}

/**
 * 保存API密钥
 */
export const saveApiKey = async (data: SaveApiKeyDto): Promise<SDF<ApiKeyResponseDto>> => {
	const res = await instance.post<SaveApiKeyDto, SDF<ApiKeyResponseDto>>('/llm-apikey', data);
	return res.data;
};

/**
 * 获取API密钥列表
 */
export const getApiKeys = async (query?: QueryApiKeyDto): Promise<SDF<ApiKeyResponseDto[]>> => {
	const res = await instance.get<SDF<ApiKeyResponseDto[]>>('/llm-apikey', { params: query });
	return res.data;
};

/**
 * 根据ID获取API密钥
 */
export const getApiKeyById = async (id: string): Promise<SDF<ApiKeyResponseDto>> => {
	const res = await instance.get<SDF<ApiKeyResponseDto>>(`/llm-apikey/${id}`);
	return res.data;
};

/**
 * 更新API密钥
 */
export const updateApiKey = async (
	id: string,
	data: UpdateApiKeyDto
): Promise<SDF<ApiKeyResponseDto>> => {
	const res = await instance.put<UpdateApiKeyDto, SDF<ApiKeyResponseDto>>(
		`/llm-apikey/${id}`,
		data
	);
	return res.data;
};

/**
 * 删除API密钥
 */
export const deleteApiKey = async (id: string): Promise<SDF<{ success: boolean; message: string }>> => {
	const res = await instance.delete<SDF<{ success: boolean; message: string }>>(`/llm-apikey/${id}`);
	return res.data;
};

/**
 * 获取支持的LLM提供商列表
 */
export const getSupportedProviders = async (): Promise<SDF<ProviderInfo[]>> => {
	const res = await instance.get<SDF<ProviderInfo[]>>('/llm-apikey/providers/list');
	return res.data;
};
