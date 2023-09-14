import { readFile } from 'fs/promises';

export default class Utilities {
	static getValueFromObject(object, pathString) {
		return pathString.split('.').reduce((acc, part) => acc ? acc[part] : null, object);
	}

	static getObjectFromArrayWhereObjectContainsValue(array, key, value) {
		return array.find((object) => object[key] === value);
	}

	static async readJSONFile(filePath) {
		try {
			const data = await readFile(filePath, 'utf8');
			return JSON.parse(data);
		} catch (err) {
			console.error('An error occurred:', err);
		}
	}
}