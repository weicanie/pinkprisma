export enum UserPlan {
	Free = 'free',
	Pro = 'pro'
}
export interface UserInfoFromToken {
	userId: string;
	username: string;
	role: string;
	plan: UserPlan;
}

export type VerifyMetaData = {
	requireLogin?: boolean; //是否需要登录
	roles?: string[]; //需要的RABC权限

	requireOwn?: boolean; //是否需要所有权验证
	tableName?: string; //表名
};
