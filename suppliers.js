const suppliers = {
    "digikey": {
        name: "DigiKey",
        type: "csv",
        fileType: ".csv",
        decimalPlaces: 5,
    },
    "farnell": {
        name: "Farnell",
        type: "csv",
        fileType: ".csv",
        decimalPlaces: 4,
    },
    "avnet": {
        name: "Avnet",
        type: "csv",
        fileType: ".csv",
        decimalPlaces: 4,
        config: {
            delimiter: '\t',
        },
        beta: true,
    },
    "mouser": {
        name: "Mouser",
        type: "xls",
        fileType: ".xls",
        decimalPlaces: 3,
    },
    "rs": {
        name: "RS",
        type: "rs",
        fileType: ".html",
        beta: true,
        decimalPlaces: 5,
        instructions: [
            'Before checkout, navigate to your RS basket page',
            'Download the page as a .html file (not .mhtml)',
            'Upload the file below',
        ]
    },
}