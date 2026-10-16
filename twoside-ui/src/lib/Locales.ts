export class Locales {
	static SUPPORTED_TIMEZONES = [
		'Africa/Lagos',
	  'Africa/Accra',
	  'Europe/London',
	  'Australia/Sydney',
	  'America/New_York',
	] as const;

	static SUPPORTED_CURRENCY_SYMBOLS = [
		'₦', 
		'₵', 
		'£', 
		'$'
	] as const;

	static TIMEZONE_LABELS: Record<typeof Locales.SUPPORTED_TIMEZONES[number], string> = {
	  'Africa/Lagos': 'Lagos (WAT)',
	  'Africa/Accra': 'Accra (GMT)',
	  'Europe/London': 'London (GMT/BST)',
	  'Australia/Sydney': 'Sydney (AEST/AEDT)',
	  'America/New_York': 'New York (EST/EDT)',
	} as const;
	
	static CURRENCY_LABELS: Record<typeof Locales.SUPPORTED_CURRENCY_SYMBOLS[number], string> = {
	  '₦': 'Naira (₦)',
	  '₵': 'Cedi (₵)',
	  '£': 'Pound (£)',
	  '$': 'Dollar ($)',
	} as const;   
}