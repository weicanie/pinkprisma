import {
    apiKeyLsService,
    type QueryApiKeyDto,
    type SaveApiKeyDto,
    type UpdateApiKeyDto
} from '@/services/apikey/apikey_ls.service';
import type { APIProvider, ServerDataFormat } from '@prisma-ai/shared';

/**
 * 模拟异步操作的Promise封装
 *
 * @description 保持和后端的接口一致
 * @param action - 要执行的同步操作
 * @param delay - 模拟的网络延迟（毫秒）
 */
const createAsyncApi = <T>(action: () => T, delay = 0): Promise<ServerDataFormat<T>> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				const result = action();
				resolve({
					code: '0',
					data: result,
					message: 'ok'
				});
			} catch (error) {
				reject(error);
			}
		}, delay);
	});
};

/**
 * 封装了对 ApiKeyLsService 的调用，使其看起来像异步的API请求
 */
export const apiKeyLsApi = {
	saveApiKey: (dto: SaveApiKeyDto) => createAsyncApi(() => apiKeyLsService.saveApiKey(dto)),

	getApiKeys: (query: QueryApiKeyDto = {}) =>
		createAsyncApi(() => apiKeyLsService.getApiKeys(query)),

	getApiKeyById: (id: string) => createAsyncApi(() => apiKeyLsService.getApiKeyById(id)),

	updateApiKey: (id: string, dto: UpdateApiKeyDto) =>
		createAsyncApi(() => apiKeyLsService.updateApiKey(id, dto)),

	deleteApiKey: (id: string) => createAsyncApi(() => apiKeyLsService.deleteApiKey(id)),

	getSupportedProviders: () => createAsyncApi(() => apiKeyLsService.getSupportedProviders()),

	getApiKeyByProvider: (provider: APIProvider) =>
		createAsyncApi(() => apiKeyLsService.getApiKeyByProvider(provider))
};
