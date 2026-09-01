export const phoneNumbers = {
	police: "100",
	fire: "101",
	ambulance: "102",
	bipad: "1234",
	neoc: "1149",
	childHelpline: "1098",
	missingChild: "104",
	touristPolice: "1144",
} as const;

export type PhoneId = keyof typeof phoneNumbers;

export const nepalEmergencyIds = ["police", "fire", "ambulance", "bipad", "neoc"] as const;

export const phoneSourceHrefs: Record<PhoneId, string | null> = {
	police: null,
	fire: null,
	ambulance: null,
	bipad: null,
	neoc: null,
	childHelpline: null,
	missingChild: null,
	touristPolice: null,
};
