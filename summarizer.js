const MAX_SUMMARY_LENGTH = 1500;

/**
 * Breaks long text down into smaller chunks for separate summarizations.
 * @param {string} text Text to chunk.
 * @param {number} tokenCount Number of tokens per chunk.
 * @returns {string[]} Array of input text broken into chunks.
 */
function chunk(text, tokenCount) {
	const result = [];
	const tokens = text.split(' ');

	let curr = [];
	let i = tokenCount;
	for (const token of tokens) {
		curr.push(token);

		if (i) {
			i--;
			continue;
		}

		result.push(curr.join(' '));
		curr = [];
		i = tokenCount;
	}

	if (curr.length) {
		result.push(curr.join(' '));
	}

	return result;
}

/**
 * Makes API call to summary text.
 * @param {string} text Text payload to summarize.
 * @returns {string} Summary text.
 */
async function getResponse(text) {
	// TODO: serverless function to call hugging face
	// so access token is not exposed.
    // Better yet, use local inference.
	const response = await fetch(
		`https://api-inference.huggingface.co/models/${encodeURIComponent(
			import.meta.env.VITE_HF_MODEL,
		)}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				inputs: text,
				// parameters: {
				// 	max_length: 1024 * 24,
				// },
			}),
		},
	);

	if (
		response.status === 200 &&
		response.headers.get('content-type').includes('application/json')
	) {
		const data = await response.json();

		if (Array.isArray(data) && 'summary_text' in data[0]) {
			return data[0].summary_text;
		} else {
			console.error('unexpected data type');
		}
	} else {
		const err = await response.text();
		console.error(err, response.status, response.statusText);
	}
}

/**
 * Summarizes text.
 * @param {string} text Text to summarize.
 * @returns {Promise<string>} Summary.
 */
export async function summarize(text) {
	console.log(text, text.length);
	const chunks = chunk(text, 700);
	const summaries = [];
	try {
		for (const c of chunks) {
			console.log(c.split(' ').length);
			const summary = await getResponse(c);
			summaries.push(summary);
		}

		const joined = summaries.join(' ');

		if (joined.length < MAX_SUMMARY_LENGTH) {
			return joined;
		}

		const summary = await getResponse(summaries.join(' '));

		return summary;
	} catch (e) {
		console.error('Encountered an error: ', e);
	}
}
