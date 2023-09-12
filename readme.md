# HAR Data Processing

This utility reads a `.har` (HTTP Archive) file, extracts specific data related to JavaScript files, and saves it as a `.csv` file. 

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

Then, to process the `.har` file, use the script 'process' with the `.har` file path as the third parameter:

```bash
npm run process -- /path/to/your/file.har
```

For instance, if you have a `.har` file named 'network.har' in the 'data' directory, you would run:

```bash
npm run process -- ./data/network.har
```

This will generate a `.csv` file in the `generated-csv` directory with the same name as the `.har` file. It will process all network calls in the `.har` file.

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

Note: only one of the fourth or fifth parameters can be used at a time. An error will be thrown if both are used.



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