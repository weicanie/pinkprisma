export const getUserRole = () => {
	const userInfo = localStorage.getItem('userInfo');
	const userInfoData = userInfo && JSON.parse(userInfo);
	return userInfoData?.role;
};
