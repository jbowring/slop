const suppliers = {
    "digikey": {
        name: "DigiKey",
        types: [
            "csv",
            "xls",
        ],
        fileTypes: [
            ".csv",
            ".xlsx"
        ],
        decimalPlaces: 5,
    },
    "farnell": {
        name: "Farnell",
        types: [
            "csv",
        ],
        fileTypes: [
            ".csv"
        ],
        decimalPlaces: 4,
    },
    "avnet": {
        name: "Avnet",
        types: [
            "csv",
        ],
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
        types: [
            "xls",
        ],
        fileTypes: [
            ".xls"
        ],
        decimalPlaces: 3,
    },
    "rs": {
        name: "RS",
        types: [
            "rs",
        ],
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
        types: [
            "xls",
        ],
        fileTypes: [
            ".xls"
        ],
        decimalPlaces: 2,
    },
}