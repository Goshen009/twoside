class SupportedLocales {
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
}

export default SupportedLocales;