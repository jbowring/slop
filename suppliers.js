const suppliers = {
    "digikey": {
        name: "DigiKey",
        type: "csv",
        fileTypes: [
            ".csv"
        ],
        decimalPlaces: 5,
    },
    "farnell": {
        name: "Farnell",
        type: "csv",
        fileTypes: [
            ".csv"
        ],
        decimalPlaces: 4,
    },
    "avnet": {
        name: "Avnet",
        type: "csv",
        fileTypes: [
            ".csv"
        ],
        decimalPlaces: 4,
        config: {
            delimiter: '\t',
        },
    },
    "mouser": {
        name: "Mouser",
        type: "xls",
        fileTypes: [
            ".xls"
        ],
        decimalPlaces: 3,
    },
    "rs": {
        name: "RS",
        type: "rs",
        fileTypes: [
            ".htm",
            ".html"
        ],
        decimalPlaces: 5,
        instructions: [
            'Before checkout, navigate to your RS basket page',
            'Download the page as a .htm or .html file (not .mhtml)',
            'Upload the file below',
        ]
    },
    "thorlabs": {
        name: "Thorlabs",
        type: "xls",
        fileTypes: [
            ".xls"
        ],
        decimalPlaces: 2,
    },
}