/**
 * 定义回调函数的接口
 */
interface Callbacks {
	onCollapse: () => void;
	onScrollTop: () => void;
}
//redux无法存储函数（不能序列化）
/**
 * 用于存储所有控件回调函数的记录
 * @type {Record<string, Callbacks>}
 */
const controlCallbacks: Record<string, Callbacks> = {};

/**
 * 注册一个控件的回调函数
 * @param {string} id - 控件的唯一标识符
 * @param {Callbacks} callbacks - 包含onCollapse和onScrollTop回调的对象
 */
export const registerControlCallbacks = (id: string, callbacks: Callbacks) => {
	controlCallbacks[id] = callbacks;
};

/**
 * 注销一个控件的回调函数
 * @param {string} id - 要注销的控件的唯一标识符
 */
export const unregisterControlCallbacks = (id: string) => {
	delete controlCallbacks[id];
};

/**
 * 获取指定ID控件的回调函数
 * @param {string} id - 控件的唯一标识符
 * @returns {Callbacks | undefined} 返回找到的回调函数对象，如果未找到则返回undefined
 */
export const getControlCallbacks = (id: string): Callbacks | undefined => {
	return controlCallbacks[id];
};
