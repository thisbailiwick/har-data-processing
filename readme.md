# HAR Data Processing

This utility reads a `.har` (HTTP Archive) file, extracts specific and customizable data, then saves it as a `.csv` file. 

## Data Saved to CSV

The tool extracts and saves the following data for each JavaScript file found:

- URL of the script
- Initiator Stack (only for script or parser initiators)
- Wait time for server response
- Time taken to download the script from the server
- Total Wait and Downloading time
- Total time

## Usage

First, install the dependencies:

```bash
npm install
```

### Command Line Interface

Then, to process the `.har` file, use the script 'process' with the `.har` file path as the third parameter:

```bash
npm run process -- /path/to/your/file.har
```

For instance, if you have a `.har` file named 'network.har' in the 'data' directory, you would run:

```bash
npm run process -- ./data/network.har
```

This will generate a `.csv` file in the `generated-csv` directory with the same name as the `.har` file. It will process all network calls in the `.har` file.

#### Filtering Via File Extension or Resource Type

If you would like to filter out to specific (`js`, `css`, `jpg`, etc.) files, you can add a fourth parameter to the command:

```bash
npm run process -- ./data/network.har 'js,css'
```
This will only process network calls that have a file extension of `js` or `css`.

If you would like to filter down to a specific resource type (e.g. `script`, `image`, `stylesheet`, etc.), you can add a fifth parameter to the command:

```bash
npm run process -- ./data/network.har null 'script'
```
This will only process network calls that have resource type of script.  Using this for `image` resource types will be an easy way to get all images, without having to specify all the image extensions.

Note: only one of the fourth or fifth parameters can be used at a time. An error will be thrown if both are used. Also, custom functions as seen below in the Node Module implementation are not available in CLI.

### Node Module

Call this function:
```javascript
async runProcessing(filepath, fileTypesToProcess, resourceTypesToProcess, customConfigPath = '', customFunctions = [])
```

Like this:
```javascript
const harProcessor = new HarProcessor();
await harProcessor.runProcessing(
  './data/sample.har',
  ['.js', '.css'],
  [],
  './config/custom-config.json',
  [customFunction1, customFunction2]
);
```


## Parameters

1. **`filepath`**: The path to the HAR (HTTP Archive) file you want to process.
   - **Type**: String
   - **Example**: `'./data/sample.har'`

2. **`fileTypesToProcess`**: An array of file extensions you want to process from the HAR data.
   - **Type**: Array of Strings
   - **Example**: `['.js', '.css']`

3. **`resourceTypesToProcess`**: An array of resource types you want to process from the HAR data.
   - **Type**: Array of Strings
   - **Example**: `['Document', 'XHR', 'Script', 'Stylesheet']`

4. **`customConfigPath`** (Optional): The path to a custom JSON configuration file. If not provided, the function will use a default configuration file.
   - **Type**: String
   - **Example**: `'./config/custom-config.json'`
   - **Default**: `''`

5. **`customFunctions`** (Optional): An array of custom functions that you can pass to modify or extend the processing behavior.
   - **Type**: Array of Functions
   - **Example**: `[customFunction1, customFunction2]`
   - **Default**: `[]`

## Notes
- You can specify either `fileTypesToProcess` or `resourceTypesToProcess`, but not both. If both are specified, the function will log an error message and return it.

## Setting Values Saved to CSV
HAR's are javascript objects. We can add specific data from the entries found in the `log.entries` index. Here's an [example](https://raw.githubusercontent.com/thisbailiwick/har-data-processing/main/tests/example.har) of a HAR file. 
If you add a custom config file at `./config-har-data-process.json` you can add data to the CSV file. Here's an example of the config file:

```json
{
    "entryFields": [
        {
          "title": "URL",
          "value": "request.url",
          "type": "entry path"
        },
        {
          "title": "Initiator Stack",
          "value": "customGetInitiatorStack",
          "type": "custom function"
        }
    ]
}
```
The `entry path` type is used to get a value from the entry object. The `custom function` type is used to run a custom function on the entry object. The `value` field is used to get the value from the entry object. The `title` field is used as the column header in the CSV file. 

When using a custom function 



## Main Dependencies

* **csv-writer**: ^1.6.0 - Used for writing the processed data to a .csv file.

## Future Improvements
- Ability to add other items from the HAR file via simple index name or extending via custom code.
- Tests

## Author 

Kevin Clark

## License
This project is licensed under the MIT License.

---

Does this updated README.md meet your requirements? Let me know if you have any further requests.