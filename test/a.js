

const a = {"sections":[{"name":"Arts","path":"/arts"},{"name":"Comics & Illustration","path":"/comics-illustration"},{"name":"Design & Tech","path":"/design-tech"},{"name":"Film","path":"/film"},{"name":"Food & Craft","path":"/food-craft"},{"name":"Games","path":"/games"},{"name":"Music","path":"/music"},{"name":"Publishing","path":"/publishing"}],"currencies":[["€  Euro   (EUR)","EUR"],["$  Australian Dollar   (AUD)","AUD"],["$  Canadian Dollar   (CAD)","CAD"],["Fr   Swiss Franc   (CHF)","CHF"],["kr  Danish Krone   (DKK)","DKK"],["£  Pound Sterling   (GBP)","GBP"],["$  Hong Kong Dollar   (HKD)","HKD"],["¥  Japanese Yen   (JPY)","JPY"],["$  Mexican Peso   (MXN)","MXN"],["kr  Norwegian Krone   (NOK)","NOK"],["$  New Zealand Dollar   (NZD)","NZD"],["zł  Zloty   (PLN)","PLN"],["kr  Swedish Krona   (SEK)","SEK"],["$  Singapore Dollar   (SGD)","SGD"],["$  US Dollar   (USD)","USD"]],"current_currency":"USD"}

const util = require('util');


console.log(util.inspect(a.currencies, {depth: null}));
