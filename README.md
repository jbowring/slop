# slop - SyteLine Order Processor

Simple web app for taking basket exports from various online supplier websites and turning them into a format that can be pasted into a SyteLine purchase order. It's not groundbreaking stuff, but doing it manually is just __painful__ for a 43-line RS purchase.

The format outputted from this tool may be specific to the SyteLine configuration I use. Feel free to fork and modify for your own purposes.

## Suppliers
Currently supported are:
* Avnet
* DigiKey
* Farnell
* Mouser
* RS
* Thorlabs

Any other supplier that allows you to export your basket as a `.csv` or `.xls` _may_ work but this depends on the headers used in the exports.

## Credits
Made with many thanks to the following projects:
* [Bootstrap](https://getbootstrap.com)
* [jQuery](https://jquery.com)
* [PapaParse](https://www.papaparse.com)
* [SheetJS](https://sheetjs.com)
* [Esprima](https://esprima.org)
* [escodegen](http://github.com/estools/escodegen)
* [favicon.io](https://favicon.io)

Hosted with [Cloudflare Pages](https://pages.cloudflare.com) at [slop.bowring.uk](https://slop.bowring.uk).
