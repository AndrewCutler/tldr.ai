const isDebug = import.meta.env.MODE === 'development';

export function loginfo(...args) {
	if (isDebug) {
		console.log(...args);
	}
}

export function logwarn(...args) {
	if (isDebug) {
		console.warn(...args);
	}
}

export function logerror(...args) {
	if (isDebug) {
		console.error(...args);
	}
}
