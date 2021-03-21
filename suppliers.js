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
        beta: true,
    },
    "rs": {
        name: "RS",
        type: "rs",
        fileType: ".html",
        beta: true,
    },
}