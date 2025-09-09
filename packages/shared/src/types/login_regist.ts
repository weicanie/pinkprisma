interface RegistResponse {
	id: number;
	username: string;
	role: string;
	email: string;
	plan: string;
	create_at: Date | null;
}
interface LoginResponse {
	id: number;
	username: string;
	create_at: Date | null;
	update_at: Date | null;
	role: string;
	email: string;
	token: string;
	userId?: number; //前端添加
}
export { type LoginResponse, type RegistResponse };
