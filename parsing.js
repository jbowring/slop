class Product {
    constructor(description, quantity, price) {
        this.description = description;
        this.quantity = quantity;
        this.price = price;
    }
}

function RsParse(file, callback) {
    let reader = new FileReader();
    reader.onerror = () => {
        callback([], ["Failed to read file:\n" + reader.error])
    };
    reader.onload = file => {
        let rsJs = "", parser = new DOMParser().parseFromString(file.target.result.toString(), "text/html");
        for (const script of parser.scripts) {
            rsJs += script.text + "\n"
        }

        let pageData, parsed = null;
        try {
            parsed = esprima.parseScript(rsJs, {tolerant: true})
        } catch {}

        if (parsed !== null && 'body' in parsed) {
            for (const bodyKey of parsed.body) {
                if (bodyKey.type === "VariableDeclaration" && 'declarations' in bodyKey) {
                    for (const declaration of bodyKey.declarations) {
                        if (
                            declaration.type === "VariableDeclarator" &&
                            'id' in declaration &&
                            declaration.id.type === "Identifier" &&
                            declaration.id.name === "pageData" &&
                            'init' in declaration
                        ) {
                            pageData = JSON.parse(escodegen.generate(declaration.init, { format: {json: true} }));
                        }
                    }
                }
            }
        } else {
            callback([], ["Failed to parse HTML"]);
            return;
        }

        let totalCosts = []
        try {
            let shoppingBasketForm = parser.getElementById('shoppingBasketForm:WebBasketLineWidgetActionVALIDATION_ERROR_EVENT')
            for (const table of shoppingBasketForm.getElementsByClassName('cartTable')) {
                for (const tbody of table.getElementsByTagName('tbody')) {
                    for (const tr of tbody.getElementsByClassName('dataRow lineRow')) {
                        for (const costTd of tr.getElementsByClassName('costTd')) {
                            for (const costColumn of costTd.getElementsByClassName('costColumn')) {
                                let cost = parseCurrencyDecimal(costColumn.innerText)
                                if (!isNaN(cost)) {
                                    totalCosts.push(cost)
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (!(error instanceof TypeError)) {
                throw error;
            }
        }

        let products = [];
        let errors = [];
        let showWarning = false;
        const pageDataDecimals = 3;
        if(
            typeof pageData === 'object' &&
            'products' in pageData &&
            'basketBreakPrices' in pageData &&
            pageData.products.length > 0 &&
            pageData.basketBreakPrices.length > 0
        ) {
            if(
                pageData.products.length !== pageData.basketBreakPrices.length ||
                pageData.products.length !== totalCosts.length
            ) {
                showWarning = true;
            }
            let numProducts = Math.min(pageData.products.length, pageData.basketBreakPrices.length)

            for (let i = 0; i < numProducts; i++) {
                let basketBreakPrice = pageData.basketBreakPrices[i];
                if (typeof basketBreakPrice === 'string') {
                    try {
                        basketBreakPrice = JSON.parse(basketBreakPrice)
                    } catch {}
                }

                const product = pageData.products[i];

                let breakPrices = {};
                if(typeof basketBreakPrice === 'object' && 'breakPrices' in basketBreakPrice) {
                    for (const breakPrice of basketBreakPrice.breakPrices) {
                        let quantity = NaN, price = NaN;
                        if ('quantity' in breakPrice && 'price' in breakPrice) {
                            quantity = parseFloat(breakPrice.quantity);
                            if (typeof price == 'string') {
                                price = parseCurrencyDecimal(breakPrice.price);
                            } else {
                                price = parseFloat(breakPrice.price)
                            }
                        }
                        if (!isNaN(quantity) && !isNaN(price)) {
                            breakPrices[quantity] = price;
                        } else {
                            showWarning = true;
                            breakPrices = {};
                            break;
                        }
                    }
                }

                let quantity = NaN;
                try {
                    if ('orderQuantity' in product && 'quantity' in product.orderQuantity) {
                        quantity = parseFloat(product.orderQuantity.quantity)
                    }
                } catch {}

                if(
                    Object.keys(breakPrices).length !== 0 &&
                    'description' in product &&
                    !isNaN(quantity)
                ) {
                    for (const breakQuantity of Object.keys(breakPrices).sort((a,b) => a-b).reverse()) {
                        if (quantity >= breakQuantity) {
                            let price = breakPrices[breakQuantity]
                            if(i < totalCosts.length) {
                                let webpageCost = totalCosts[i] / quantity;
                                if(Math.abs(webpageCost - parseFloat(webpageCost.toFixed(pageDataDecimals))) > Number.EPSILON) {
                                    // webpage cost is more accurate than pageData cost
                                    price = webpageCost
                                }
                            }
                            products.push(new Product(
                                String(product.description),
                                quantity,
                                price,
                            ))
                            break;
                        }
                    }
                } else {
                    showWarning = true;
                }
            }
        } else {
            errors.push('Data not found in webpage')
        }
        callback(products, errors, showWarning)
    };
    reader.readAsText(file);
}

function parseCurrencyDecimal(string) {
    // Remove extraneous characters
    string = string.replace(/[^0-9.,]/g, '')

    let separators = string.match(/[^0-9]/g)
    if (separators !== null && separators.length > 0) {
        let decimalSeparator = separators[separators.length - 1]

        // Remove all other separators
        string = string.replace(RegExp('[^0-9' + decimalSeparator + ']', 'g'), '')

        // Format with decimal point
        if (decimalSeparator !== '.') {
            string = string.replace(/[^0-9]/g, '.')
        }
    }
    return parseFloat(string);
}

function findData(data, callback) {
    const translations = {
        Description: {
            regex: [
                /(?:manufacturer)?description/,
                /products/,
                /item/,
            ],
        },
        Quantity: {
            regex: [
                /quantity/,
                /(?:order)?qty/,
            ],
        },
        Price: {
            regex: [
                /unit(?:cost|price)/,
                /price(?:[A-Z]{3}|unit)/,
                /price/,
            ],
        },
        Discount: {
            optional: true,
            regex: [
                /discountprice/
            ],
        },
        Surcharge: {
            optional: true,
            regex: [
                /surcharge/,
            ],
        },
    }

    // Add "ignore case" flag
    for (const translation in translations) {
        translations[translation].regex = translations[translation].regex.map(regex => RegExp(regex.source, "i"));
    }

    let headerMap;
    let headerRow = null;
    for (let row = 0; row < data.length; row++) {
        headerMap = {};
        if (Object.keys(translations).every(header => {
            for (const [col, cell] of Object.entries(data[row])) {
                if (!Object.values(headerMap).includes(col) && translations[header].regex.some(regex => {
                    return cell.replace(/\W/g, '').match(regex) !== null;
                })) {
                    headerMap[header] = col;
                    return true;
                }
            }
            return ('optional' in translations[header] && translations[header].optional)
        })) {
            headerRow = row;
            break;
        }
    }

    if(headerRow === null) {
        callback([], [Object.keys(translations).join(", ") + " headers not found"]);
        return;
    }

    let products = [], errors = [];
    let showWarning = false, end = false;
    for (const line of data.slice(headerRow+1)) {
        if(line.every(value => value === "")) {
            break;
        }

        let price = parseCurrencyDecimal(line[headerMap.Price]);
        let quantity = parseFloat(line[headerMap.Quantity].replaceAll(',', ''));

        if(line[headerMap.Description] === "" || isNaN(quantity) || isNaN(price)) {
            end = true;
        } else {
            if(end) {
                showWarning = true;
            }

            if ('Discount' in headerMap) {
                let discount = parseCurrencyDecimal(line[headerMap.Discount])
                if (!isNaN(discount) && discount > 0 && discount < price) {
                    price = discount
                }
            }

            products.push(new Product(
                line[headerMap.Description],
                quantity,
                price,
            ))

            if ('Surcharge' in headerMap) {
                let surcharge = parseCurrencyDecimal(line[headerMap.Surcharge])
                if (!isNaN(surcharge) && surcharge > 0) {
                    products.push(new Product(
                        'Surcharge for ' + line[headerMap.Description],
                        1,
                        surcharge,
                    ))
                }
            }
        }
    }
    callback(products, errors, showWarning);
}

function XlsParse(file, callback) {
    let reader = new FileReader();
    reader.onload = file => {
        let data = new Uint8Array(file.target.result);
        let workbook = XLSX.read(data, {type: 'array'});
        if(workbook.Sheets.length < 1 || workbook.SheetNames.length < 1) {
            callback([], ["No sheets found in workbook"])
            return;
        }
        findData(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {raw:false, header:1}), callback);
    };
    reader.onerror = () => {
        callback([], ["Failed to read file:\n" + reader.error])
    };
    reader.readAsArrayBuffer(file);
}

function CsvParse(file, callback, config) {
    if (!config) {
        config = {};
    }

    Papa.parse(file, {
        complete: function (results) {
            let errors = [];
            for (const error of results.errors) {
                if(! ['TooFewFields', 'TooManyFields'].includes(error.code) )
                    errors.push("<b>Row " + error.row + ":</b> " + error.message);
            }

            if(errors.length !== 0) {
                callback([], errors);
            } else {
                findData(results.data, callback);
            }
        },
        delimiter: input => {
            let delimiter = ',';
            if ('delimiter' in config) {
                delimiter = config.delimiter;
            }
            let sepMatch = input.match(/^sep=([^\r\n])/i);
            if (sepMatch !== null && sepMatch.length > 1) {
                delimiter = sepMatch[1];
            }

            return delimiter;
        },
    });
}