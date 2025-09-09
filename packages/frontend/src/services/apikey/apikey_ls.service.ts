// packages/frontend/src/utils/apikey_ls.service.ts

import { AIChatLLM, APIProvider, SelectedLLM } from '@prisma-ai/shared';

/**
 * 定义存储在 Local Storage 中的 API 密钥的数据结构
 */
export interface ApiKeyEntity {
	id: string; // 使用UUID或者时间戳作为唯一标识
	provider: APIProvider;
	apiKey: string; // 注意：在LS中是明文存储
	alias?: string;
	create_at: string;
	update_at: string;
}

/**
 * 用于响应给UI层的数据传输对象（DTO），不包含敏感的apiKey
 */
export interface ApiKeyResponseDto {
	id: string;
	provider: APIProvider;
	alias?: string;
	create_at: string;
	update_at: string;
}

// 定义传入DTO
export interface SaveApiKeyDto {
	provider: APIProvider;
	apiKey: string;
	alias?: string;
}

export interface UpdateApiKeyDto {
	apiKey?: string;
	alias?: string;
}

export interface QueryApiKeyDto {
	provider?: APIProvider;
	alias?: string;
}

const LS_KEY = 'prisma-hub-apikeys';

/**
 * 基于浏览器 Local Storage 的 API 密钥管理服务
 * 模拟后端服务的行为，提供API密钥的CRUD操作接口
 */
class ApiKeyLsService {
	/**
	 * 将数据库实体转换为安全的响应DTO
	 * @param entity - 存储在LS中的完整实体
	 * @returns - 不含apiKey的DTO
	 */
	private toResponseDto(entity: ApiKeyEntity): ApiKeyResponseDto {
		return {
			id: entity.id,
			provider: entity.provider,
			alias: entity.alias,
			create_at: entity.create_at,
			update_at: entity.update_at
		};
	}

	/**
	 * 从 Local Storage 中获取所有API密钥
	 * @returns - ApiKeyEntity数组
	 */
	private getAllKeysFromLs(): ApiKeyEntity[] {
		try {
			const storedKeys = localStorage.getItem(LS_KEY);
			return storedKeys ? JSON.parse(storedKeys) : [];
		} catch (error) {
			console.error('Failed to parse API keys from Local Storage:', error);
			return [];
		}
	}

	/**
	 * 将API密钥数组保存到 Local Storage
	 * @param keys - ApiKeyEntity数组
	 */
	private saveAllKeysToLs(keys: ApiKeyEntity[]): void {
		localStorage.setItem(LS_KEY, JSON.stringify(keys));
	}

	/**
	 * 保存一个新的API密钥
	 * @param dto - 保存密钥所需的数据
	 * @returns - 新创建密钥的DTO
	 */
	public saveApiKey(dto: SaveApiKeyDto): ApiKeyResponseDto {
		if (!dto.apiKey || !dto.provider) {
			throw new Error('API密钥和提供商不能为空');
		}

		const allKeys = this.getAllKeysFromLs();

		// 检查别名是否重复
		if (dto.alias) {
			const existing = allKeys.find(k => k.provider === dto.provider && k.alias === dto.alias);
			if (existing) {
				throw new Error(`别名 "${dto.alias}" 在提供商 "${dto.provider}" 下已存在`);
			}
		}

		const now = new Date().toISOString();
		const newKey: ApiKeyEntity = {
			id: crypto.randomUUID(),
			provider: dto.provider,
			apiKey: dto.apiKey,
			alias: dto.alias,
			create_at: now,
			update_at: now
		};

		allKeys.push(newKey);
		this.saveAllKeysToLs(allKeys);

		return this.toResponseDto(newKey);
	}

	/**
	 * 获取API密钥列表
	 * @param query - 查询参数
	 * @returns - 符合条件的密钥DTO列表
	 */
	public getApiKeys(query: QueryApiKeyDto = {}): ApiKeyResponseDto[] {
		let allKeys = this.getAllKeysFromLs();

		if (query.provider) {
			allKeys = allKeys.filter(k => k.provider === query.provider);
		}

		if (query.alias) {
			allKeys = allKeys.filter(k => k.alias?.includes(query.alias || ''));
		}

		return allKeys
			.map(this.toResponseDto)
			.sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime());
	}

	/**
	 * 根据ID获取单个API密钥
	 * @param id - 密钥ID
	 * @returns - 单个密钥的DTO
	 */
	/**
	 * 根据提供商获取API密钥实体（包含apiKey）
	 * @param provider - API提供商
	 * @returns - 完整的ApiKeyEntity或null
	 */
	public getApiKeyByProvider(provider: APIProvider): ApiKeyEntity | null {
		const allKeys = this.getAllKeysFromLs();
		// 返回找到的第一个该提供商的key
		const key = allKeys.find(k => k.provider === provider);
		return key || null;
	}

	/**
	 * 根据ID获取单个API密钥
	 * @param id - 密钥ID
	 * @returns - 单个密钥的DTO
	 */
	public getApiKeyById(id: string): ApiKeyResponseDto {
		const allKeys = this.getAllKeysFromLs();
		const key = allKeys.find(k => k.id === id);
		if (!key) {
			throw new Error('API密钥不存在');
		}
		return this.toResponseDto(key);
	}

	/**
	 * 更新API密钥
	 * @param id - 要更新的密钥ID
	 * @param dto - 更新数据
	 * @returns - 更新后的密钥DTO
	 */
	public updateApiKey(id: string, dto: UpdateApiKeyDto): ApiKeyResponseDto {
		const allKeys = this.getAllKeysFromLs();
		const keyIndex = allKeys.findIndex(k => k.id === id);

		if (keyIndex === -1) {
			throw new Error('API密钥不存在');
		}

		const existingKey = allKeys[keyIndex];

		// 检查别名冲突
		if (dto.alias && dto.alias !== existingKey.alias) {
			const conflict = allKeys.find(
				k => k.id !== id && k.provider === existingKey.provider && k.alias === dto.alias
			);
			if (conflict) {
				throw new Error(`别名 "${dto.alias}" 在提供商 "${existingKey.provider}" 下已存在`);
			}
		}

		const updatedKey: ApiKeyEntity = {
			...existingKey,
			...dto,
			apiKey: dto.apiKey || existingKey.apiKey, // 如果没有提供新apiKey，则保留旧的
			update_at: new Date().toISOString()
		};

		allKeys[keyIndex] = updatedKey;
		this.saveAllKeysToLs(allKeys);

		return this.toResponseDto(updatedKey);
	}

	/**
	 * 删除API密钥
	 * @param id - 要删除的密钥ID
	 */
	public deleteApiKey(id: string): { success: boolean; message: string } {
		let allKeys = this.getAllKeysFromLs();
		const initialLength = allKeys.length;
		allKeys = allKeys.filter(k => k.id !== id);

		if (allKeys.length === initialLength) {
			throw new Error('API密钥不存在');
		}

		this.saveAllKeysToLs(allKeys);
		return { success: true, message: 'API密钥删除成功' };
	}

	/**
	 * 获取支持的LLM提供商列表（与后端服务保持一致）
	 */
	public getSupportedProviders(): Array<{ key: string; name: string; description: string }> {
		return [
			// {
			// 	key: APIProvider.deepseek,
			// 	name: 'DeepSeek',
			// 	description: 'DeepSeek Chat和Reasoner模型'
			// },
			{
				key: APIProvider.kimi,
				name: 'Kimi',
				description: 'Kimi 的模型'
			},
			{
				key: APIProvider.qwen,
				name: '千问',
				description: '千问的模型'
			},
			{
				key: APIProvider.zhipu,
				name: '智谱',
				description: '智谱的模型'
			},
			{
				key: APIProvider.proxy,
				name: '代理服务',
				description: '第三方API代理服务'
			}
		];
	}
}
/**
 * 用于获取模型对应的APIProvider
 */
export const selectedLLMToApiType = {
	[SelectedLLM.k2]: APIProvider.kimi,
	[SelectedLLM.k2_proxy]: APIProvider.proxy,
	[SelectedLLM.qwen3_proxy]: APIProvider.proxy,
	[SelectedLLM.qwen3]: APIProvider.qwen,
	[SelectedLLM.glm4_5]: APIProvider.zhipu,

	[AIChatLLM.gemini_2_5_flash]: APIProvider.proxy,
	[AIChatLLM.gemini_2_5_pro]: APIProvider.proxy,
	[AIChatLLM.gpt_5_mini]: APIProvider.proxy,
	[AIChatLLM.gpt_5]: APIProvider.proxy
};

// 前端展示的模型配置
export const modelConfigs = {
	// [SelectedLLM.v3]: {
	// 	shortName: 'V3',
	// 	fullName: 'DeepSeek Chat',
	// 	description: '通用对话、代码生成、文本处理',
	// 	scenario: 'deepseek'
	// },
	// [SelectedLLM.r1]: {
	// 	shortName: 'R1',
	// 	fullName: 'DeepSeek Reasoner',
	// 	description: '逻辑推理、思考过程、复杂问题',
	// 	scenario: 'deepseek · 不推荐'
	// },
	[SelectedLLM.k2]: {
		shortName: 'K2',
		fullName: 'Kimi K2',
		description: '长文本处理、多模态输入、国内代理',
		scenario: 'kimi · 首选模型'
	},
	[SelectedLLM.qwen3]: {
		shortName: 'Qwen3',
		fullName: 'Qwen3',
		description: '长文本处理、多模态输入、千问',
		scenario: '千问 · 首选模型'
	},
	// [SelectedLLM.qwen_plus_latest]: {
	// 	shortName: 'Qwen Plus Latest',
	// 	fullName: 'Qwen Plus Latest',
	// 	description: '最新版本、优化性能、通用任务处理',
	// 	scenario: '千问 · 最新版本'
	// },
	[SelectedLLM.glm4_5]: {
		shortName: 'GLM4.5',
		fullName: 'GLM4.5',
		description: '最新版本、优化性能、通用任务处理',
		scenario: '智谱 · 最新版本'
	},

	[SelectedLLM.qwen3_proxy]: {
		shortName: 'Qwen3',
		fullName: 'Qwen3',
		description: '长文本处理、多模态输入、千问',
		scenario: '国内代理 · 首选模型'
	},
	[SelectedLLM.k2_proxy]: {
		shortName: 'K2',
		fullName: 'Kimi K2',
		description: '长文本处理、多模态输入、国内代理',
		scenario: '国内代理 · 首选模型'
	}
};

export const aichatModelConfigs = {
	[AIChatLLM.glm4_5]: {
		shortName: 'GLM4.5',
		fullName: 'GLM4.5',
		scenario: '智谱'
	},
	[AIChatLLM.qwen3]: {
		shortName: 'Qwen3',
		fullName: 'Qwen3',
		scenario: '千问'
	},
	[AIChatLLM.k2]: {
		shortName: 'K2',
		fullName: 'Kimi K2',
		scenario: 'kimi'
	},
	[AIChatLLM.gemini_2_5_flash]: {
		shortName: '2.5 Flash',
		fullName: 'Gemini 2.5 Flash',
		scenario: '代理'
	},
	[AIChatLLM.gemini_2_5_pro]: {
		shortName: '2.5 Pro',
		fullName: 'Gemini 2.5 Pro',
		scenario: '代理'
	},
	[AIChatLLM.gpt_5_mini]: {
		shortName: 'GPT-5 Mini',
		fullName: 'GPT-5 Mini',
		scenario: '代理'
	},
	[AIChatLLM.gpt_5]: {
		shortName: 'GPT-5',
		fullName: 'GPT-5',
		scenario: '代理'
	}
};

// 导出一个单例
export const apiKeyLsService = new ApiKeyLsService();
