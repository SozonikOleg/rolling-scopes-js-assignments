'use strict';

/**
 * Returns true if word occurrs in the specified word snaking puzzle.
 * Each words can be constructed using "snake" path inside a grid with top, left, right and bottom directions.
 * Each char can be used only once ("snake" should not cross itself).
 *
 * @param {array} puzzle
 * @param {array} searchStr
 * @return {bool}
 *
 * @example
 *   var puzzle = [ 
 *      'ANGULAR',
 *      'REDNCAE',
 *      'RFIDTCL',
 *      'AGNEGSA',
 *      'YTIRTSP',
 *   ]; 
 *   'ANGULAR'   => true   (first row)
 *   'REACT'     => true   (starting from the top-right R adn follow the ↓ ← ← ↓ )
 *   'UNDEFINED' => true
 *   'RED'       => true
 *   'STRING'    => true
 *   'CLASS'     => true
 *   'ARRAY'     => true   (first column)
 *   'FUNCTION'  => false
 *   'NULL'      => false 
 */
function findStringInSnakingPuzzle(puzzle, searchStr) {
    
    function rec(exclude) {
        if (searchStr.length === exclude.length)
            return true;
        let pos = exclude[exclude.length - 1];
        for (let val of [[0, 1], [1, 0], [0, -1], [-1, 0]])
            if (
                pos[0] + val[0] >= 0 && pos[0] + val[0] < puzzle.length &&
                pos[1] + val[1] >= 0 && pos[1] + val[1] < puzzle[pos[0] + val[0]].length &&
                !exclude.some(v => v[0] === pos[0] + val[0] && v[1] === pos[1] + val[1]) &&
                puzzle[pos[0] + val[0]][pos[1] + val[1]] === searchStr[exclude.length]
            )
                if (rec(exclude.concat([[pos[0] + val[0], pos[1] + val[1]]])))
                    return true;
    }
    
    for (let i = 0; i < puzzle.length; i++)
        for (let j = 0; j < puzzle[i].length; j++)
            if (puzzle[i][j] === searchStr[0] && rec([[i, j]]))
                return true;
    return false;
}


/**
 * Returns all permutations of the specified string.
 * Assume all chars in the specified string are different.
 * The order of permutations does not matter.
 * 
 * @param {string} chars
 * @return {Iterable.<string>} all posible strings constructed with the chars from the specfied string
 *
 * @example
 *    'ab'  => 'ab','ba'
 *    'abc' => 'abc','acb','bac','bca','cab','cba'
 */
function* getPermutations(chars) {
    
    function* rec(str) {
        if (str.length === chars.length)
            yield str;
        else
            for (let i = 0; i < chars.length; i++)
                if (str.indexOf(chars[i]) < 0)
                    yield *rec(str + chars[i]);
    }
    
    yield *rec('');
}


/**
 * Returns the most profit from stock quotes.
 * Stock quotes are stores in an array in order of date.
 * The stock profit is the difference in prices in buying and selling stock.
 * Each day, you can either buy one unit of stock, sell any number of stock units you have already bought, or do nothing. 
 * Therefore, the most profit is the maximum difference of all pairs in a sequence of stock prices.
 * 
 * @param {array} quotes
 * @return {number} max profit
 *
 * @example
 *    [ 1, 2, 3, 4, 5, 6]   => 15  (buy at 1,2,3,4,5 and then sell all at 6)
 *    [ 6, 5, 4, 3, 2, 1]   => 0   (nothing to buy)
 *    [ 1, 6, 5, 10, 8, 7 ] => 18  (buy at 1,6,5 and sell all at 10)
 */
function getMostProfitFromStockQuotes(quotes) {
    let result = 0,
        quotesSorted = quotes.slice(0).sort((a, b) => b - a);
    while (quotes.length) {
        while (quotes.indexOf(quotesSorted[0]) < 0)
            quotesSorted.shift();
        let inx = quotes.indexOf(quotesSorted[0]);
        result += quotesSorted[0] * inx;
        for (let i = 0; i < inx; i++)
            result -= quotes[i];
        quotes.splice(0, inx + 1);
    }
    return result;
}


/**
 * Class representing the url shorting helper.
 * Feel free to implement any algorithm, but do not store link in the key\value stores.
 * The short link can be at least 1.5 times shorter than the original url.
 * 
 * @class
 *
 * @example
 *    
 *     var urlShortener = new UrlShortener();
 *     var shortLink = urlShortener.encode('https://en.wikipedia.org/wiki/URL_shortening');
 *     var original  = urlShortener.decode(shortLink); // => 'https://en.wikipedia.org/wiki/URL_shortening'
 * 
 */
function UrlShortener() {
    this.urlAllowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"+
                           "abcdefghijklmnopqrstuvwxyz"+
                           "0123456789-_.~!*'();:@&=+$,/?#[]";
}

UrlShortener.prototype = {

    encode: function(url) {
        let result = '',
            char = 0;
        for (let i = 0; i < url.length; i++) {
            char = char << this.BYTES | (this.urlAllowedChars.indexOf(url[i]) + 1);
            if (i % 2 || i === url.length - 1) {
                result += String.fromCharCode(char);
                char = 0;
            }
        }
        return result;
    },
    
    decode: function(code) {
        const _AND = ~(~0 << this.BYTES);
        let result = '';
        for (let i = 0; i < code.length; i++) {
            let char = code.charCodeAt(i);
            let c = char >> this.BYTES & _AND;
            if (c)
                result += this.urlAllowedChars[c - 1];
            c = char & _AND;
            result += this.urlAllowedChars[c - 1];
        }
        return result;
    },
    
    BYTES: 7
    
}
/*function UrlShortener() {
    this.urlAllowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"+
                           "abcdefghijklmnopqrstuvwxyz"+
                           "0123456789-_.~!*'();:@&=+$,/?#[]";
}

UrlShortener.prototype = {

    encode: function(url) {
        
        let initUrl = url;
        
        function intToBin(val, len) {
            let buf = val.toString(2);
            return '0'.repeat(len - buf.length) + buf;
        }
        
        let dict = {},
            elems = [],
            phrase = '',
            pos = this.urlAllowedChars.length,
            result = '',
            bin = '',
            source = '';
        
        if (url.indexOf(this.https) === 0) {
            bin += '1';
            url = url.slice(this.https.length);
        } else {
            bin += '0';
            if (url.indexOf(this.http) === 0)
                url = url.slice(this.http.length);
        }
        if (url.indexOf(this.www) === 0) {
            bin += '1';
            url = url.slice(this.www.length);
        } else
            bin += '0';
        
        for (let i = 0; i < url.length; i++)
            source += String.fromCharCode(this.urlAllowedChars.indexOf(url[i]));
        
        phrase = source[0];
        for (let i = 1; i < source.length; i++)
            if (dict[phrase + source[i]] !== undefined)
                phrase += source[i];
            else {
                bin += intToBin(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0), pos > 127 ? 8 : 7);
                pos++;
                dict[phrase + source[i]] = pos;
                phrase = source[i];
            }
        bin += intToBin(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0), pos > 127 ? 8 : 7);
        
        if (bin.length % this.bitPerSymbol)
            bin += '0'.repeat(this.bitPerSymbol - bin.length % this.bitPerSymbol);
        
        for (let i = 0; i < Math.round(bin.length / this.bitPerSymbol); i++)
            if (this.bitPerSymbol === 6)
                result += this.base64str[Number('0b' + bin.substr(i * this.bitPerSymbol, this.bitPerSymbol))];
            else
                result += String.fromCharCode(Number('0b' + bin.substr(i * this.bitPerSymbol, this.bitPerSymbol)));
        
        //console.log(result.length, initUrl.length, initUrl.length / result.length);
        //console.log(this.decode(result));
        
        return result;
        //throw new Error('Not implemented');
    },
    
    decode: function(code) {
        
        let dict = {},
            elems = '',
            phrase = '',
            oldPhrase = '',
            currChar = '',
            pos = this.urlAllowedChars.length,
            result = '',
            bin = '',
            bits = 7;
        
        for (let i = 0; i < code.length; i++) {
            let buf;
            if (this.bitPerSymbol === 6)
                buf = this.base64str.indexOf(code[i]).toString(2);
            else
                buf = code.charCodeAt(i).toString(2);
            bin += '0'.repeat(this.bitPerSymbol - buf.length) + buf;
        }
        
        bin = bin.split('');
        if (bin.splice(0, 1)[0] === '1')
            result += this.https;
        else
            result += this.http;
        if (bin.splice(0, 1)[0] === '1')
            result += this.www;
        
        while (bin.length >= bits) {
            let currCode = Number('0b' + bin.splice(0, bits).join(''));
            if (currCode < this.urlAllowedChars.length)
                phrase = String.fromCharCode(currCode);
            else
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            elems += phrase;
            currChar = phrase.charAt(0);
            dict[pos++] = oldPhrase + currChar;
            if (pos === 128)
                bits = 8;
            oldPhrase = phrase;
        }
        
        for (let i = 0; i < elems.length; i++)
            result += this.urlAllowedChars[elems.charCodeAt(i)];
        
        return result;
    },
    
    base64str: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    https: 'https://',
    http: 'http://',
    www: 'www.',
    bitPerSymbol: 6
    
}*/


module.exports = {
    findStringInSnakingPuzzle: findStringInSnakingPuzzle,
    getPermutations: getPermutations,
    getMostProfitFromStockQuotes: getMostProfitFromStockQuotes,
    UrlShortener: UrlShortener
};
