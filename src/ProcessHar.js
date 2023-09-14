import fs from 'fs';
import { createArrayCsvWriter } from 'csv-writer';
import Utilities from './Utilities.js';

/**
 * Class for processing HAR (HTTP Archive) files.
 */
class HarProcessor {
	/**
	 * Reads a file and returns its content as a JSON object.
	 * @param {string} filePath - The path to the file to read.
	 * @returns {Promise<Object>} A Promise that resolves to the JSON content of the file.
	 */
	async readFile(filePath) {
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					console.error('An error occurred while reading the HAR file.');
					reject(err);
				}
				resolve(JSON.parse(data));
			});
		});
	}

	/**
	 * Extracts the initiator stack from an entry.
	 * @param {Object} entry - An object representing the HAR entry.
	 * @returns {string} The initiator stack as a string.
	 */
	getInitiatorStack(entry) {
		return entry._initiator.stack
			? entry._initiator.stack.callFrames.map(
				(callFrame) => `${callFrame.url} line ${callFrame.lineNumber} column ${callFrame.columnNumber}`
			).join('\n')
			: `${entry._initiator.url} line ${entry._initiator.lineNumber}`;
	}

	/**
	 * Checks if the URL's file type should be processed.
	 * @param {string} url - The URL to check.
	 * @param {boolean} fileTypesToProcessSet - Whether specific file types are set for processing.
	 * @param {string[]} fileTypesToProcess - Array of file types to process.
	 * @returns {boolean} Whether the URL's file type should be processed.
	 */
	fileTypesToProcessContains(url, fileTypesToProcessSet, fileTypesToProcess) {
		return fileTypesToProcessSet ? fileTypesToProcess.includes(url.split('.').pop()) : true;
	}

	/**
	 * Checks if the resource type should be processed.
	 * @param {string} type - The resource type to check.
	 * @param {boolean} resourceTypesToProcessSet - Whether specific resource types are set for processing.
	 * @param {string[]} resourceTypesToProcess - Array of resource types to process.
	 * @returns {boolean} Whether the resource type should be processed.
	 */
	resourceTypesToProcessContains(type, resourceTypesToProcessSet, resourceTypesToProcess) {
		return resourceTypesToProcessSet ? resourceTypesToProcess.includes(type) : true;
	}

	processField(entry, field, customFunctions) {
		let value = '';
		switch (field.type) {

			case 'custom function':
				value = Utilities.getObjectFromArrayWhereObjectContainsValue(customFunctions, 'name', field.value)(entry);
				break;

			default:
				// this is 'entry path' type
				value = Utilities.getValueFromObject(entry, field.value);
				break;
		}

		return value;
	}

	processEntryData(entries, entryFields, customFunctions) {
		return entries.map(entry =>
			entryFields.map(field =>
				this.processField(entry, field, customFunctions)
			)
		);
	}

	/**
	 * Filters and maps HAR data entries.
	 * @param {Object[]} entries - Array of HAR entries.
	 * @param {boolean} resourceTypesToProcessSet - Whether specific resource types are set for processing.
	 * @param {string[]} resourceTypesToProcess - Array of resource types to process.
	 * @param {boolean} fileTypesToProcessSet - Whether specific file types are set for processing.
	 * @param {string[]} fileTypesToProcess - Array of file types to process.
	 * @returns {Object[]} Filtered and mapped array of HAR entries.
	 */
	filterFiles(entries, resourceTypesToProcessSet, resourceTypesToProcess, fileTypesToProcessSet, fileTypesToProcess) {
		return entries
			.filter((entry) => this.fileTypesToProcessContains(entry.request.url, fileTypesToProcessSet, fileTypesToProcess))
			.filter((entry) => this.resourceTypesToProcessContains(entry._resourceType, resourceTypesToProcessSet, resourceTypesToProcess));

	}

	/**
	 * Writes data to a CSV file.
	 * @param {string} filename - The name of the output CSV file.
	 * @param {Object[]} records - Array of records to write to the CSV file.
	 * @param entryFields
	 * @returns {Promise<void>} A Promise that resolves when the write operation is completed.
	 */
	async writeCsvFile(filename, records, entryFields) {
		const header = entryFields.map((field) => {
			return [
				field.title,
			];
		});
		const csvWriter = createArrayCsvWriter({
			path: 'generated-csv/' + filename + '.csv',
			header: header
		});
		return csvWriter.writeRecords(records);
	}

	/**
	 * Processes HAR data and writes it to a CSV file.
	 * @param {string} filepath - The path to the HAR file.
	 * @param {string[]} fileTypesToProcess - Array of file types to process.
	 * @param {string[]} resourceTypesToProcess - Array of resource types to process.
	 * @param {string} customConfigPath - Path to the custom config file.
	 * @param {object[]} customFunctions - Array of custom functions to process with `id` and `function` elements. `id`
	 *  needs to match the id of the matching entryFields element in the config-har-data-processing.json file. `function` needs to be a function you
	 *  have created to process the data and return it in the format you want saved for that field's cell in the .csv.
	 * @returns {Promise<boolean|string>} A Promise that resolves to true if successful, or an error message otherwise.
	 */
	async runProcessing(filepath, fileTypesToProcess, resourceTypesToProcess, customConfigPath = '', customFunctions = []) {
		const fileTypesToProcessSet = fileTypesToProcess.length > 0;
		const resourceTypesToProcessSet = resourceTypesToProcess.length > 0;

		const config = customConfigPath ? await Utilities.readJSONFile(customConfigPath) : await Utilities.readJSONFile('./config-har-data-processing.json');

		if (fileTypesToProcessSet && resourceTypesToProcessSet) {
			let errorMessage = 'You can only specify file types or resource types, not both.';
			console.log(errorMessage);
			return errorMessage;
		}

		const filePostfix = fileTypesToProcessSet
			? fileTypesToProcess.join('-')
			: resourceTypesToProcessSet
				? resourceTypesToProcess.join('-')
				: 'all';
		const fileName = filepath.split('/').pop() + '-' + filePostfix;

		try {
			const harData = await this.readFile(filepath);
			const filteredData = this.filterFiles(
				harData.log.entries,
				resourceTypesToProcessSet,
				resourceTypesToProcess,
				fileTypesToProcessSet,
				fileTypesToProcess
			);
			const processedEntryData = this.processEntryData(filteredData, config.entryFields, customFunctions);
			await this.writeCsvFile(fileName, processedEntryData, config.entryFields);
			console.log('...Done');
			return true;

		} catch (error) {
			console.log(error);
			return false;
		}
	}
}

export default HarProcessor;
