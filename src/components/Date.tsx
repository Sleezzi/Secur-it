const getValidFormat = (number: number) => {
	return number <= 9 ? `0${number}` : number;
}

function ConvertDate(timestamp: number) {
	const date = new Date(timestamp);
	const difference = Math.floor(new Date().getDate() - date.getDate());
	
	if (difference < 1) {
		return `Aujourd'hui ${getValidFormat(date.getHours())}:${getValidFormat(date.getMinutes())}`;
	}
	if (difference < 2) {
		return `Hier ${getValidFormat(date.getHours())}:${getValidFormat(date.getMinutes())}`;
	}
	if (difference < 3) {
		return `Avant hier ${getValidFormat(date.getHours())}:${getValidFormat(date.getMinutes())}`;
	}
	
	return `${getValidFormat(date.getDate())}/${getValidFormat(date.getMonth()+1)}/${date.getFullYear()} ${getValidFormat(date.getHours())}:${getValidFormat(date.getMinutes())}`
}
export default ConvertDate;