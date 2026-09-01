export type Destination = {
	confirmed: boolean;
	wechatId: string | null;
	phone: string | null;
	qrImageSrc: string | null;
	officialChannelUrl: string | null;
};

export const kerungDestination: Destination = {
	confirmed: false,
	wechatId: null,
	phone: null,
	qrImageSrc: null,
	officialChannelUrl: null,
};

export const trekDestination: Destination = {
	confirmed: false,
	wechatId: null,
	phone: null,
	qrImageSrc: null,
	officialChannelUrl: null,
};

export const emptyDestination: Destination = {
	confirmed: false,
	wechatId: null,
	phone: null,
	qrImageSrc: null,
	officialChannelUrl: null,
};

export function destinationIsOpen(destination: Destination): boolean {
	if (destination.confirmed !== true) {
		return false;
	}
	const hasWeChat = destination.wechatId !== null && destination.wechatId.length > 0;
	const hasPhone = destination.phone !== null && destination.phone.length > 0;
	return hasWeChat || hasPhone;
}
