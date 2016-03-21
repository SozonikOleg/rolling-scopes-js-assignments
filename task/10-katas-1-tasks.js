'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    
    const sides = ['N','E','S','W'],  // use array of cardinal directions only!
          result = [];
    
    for (let i = 0; i < 4; i++) {
        const from = i % 2 ? 2 : 5;
        for (let j = -from; j <= from; j++) {
            const pos = (i * 8 + j + 32) % 32, // current position in result
                  posi = (i + (j < 0 ? -1 : 1) + 4) % 4, // previous or next position in sides
                  ja = Math.abs(j);
            result[pos] = sides[i];
            if (j) {
                /*switch (ja) {
                    case 1:
                    case 3:
                    case 5:
                        result[pos] +=
                            (ja > 1 ? sides[posi] : '') +
                            'b' +
                            (ja === 3 ? sides[i] : sides[posi]);
                        break;
                    case 2:
                        result[pos] += i % 2 ? sides[posi] + sides[i] : sides[i] + sides[posi];
                        break;
                    case 4:
                        result[pos] += sides[posi];
                        break;
                }*/
                result[pos] +=
                    ja % 2 ?
                        (
                            (ja > 1 ? sides[posi] : '') +
                            'b' +
                            (ja === 3 ? sides[i] : sides[posi])
                        ) :
                        (
                            ja === 4 ?
                            sides[posi] :
                            (i % 2 ? sides[posi] + sides[i] : sides[i] + sides[posi])
                                
                        );
            }
        }
    }
    return result.map((v, i) => {
        return {
            abbreviation: v,
            azimuth: i * 11.25
        };
    });
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    
    function getArray(str, addEmpty) {
        let values = [],
            value = '',
            skip = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '}') {
                skip--;
                if (!skip) {
                    values.push(new getVariants(value));
                    value = '';
                } else
                    value += str[i];
            } else if (str[i] === '{') {
                if (!skip) {
                    if (value)
                        values.push(value);
                    value = '';
                } else
                    value += str[i];
                skip++;
            } else
                value += str[i];
        }
        if (value || addEmpty)
            values.push(value);
        
        this.current = function() {
            let result = '';
            for (let v of values)
                    if (typeof v === 'string')
                    result += v;
                else
                    result += v.current();
            return result;
        };
        
        this.next = function() {
            for (let v of values)
                if (typeof v !== 'string')
                    if (v.next())
                        return true;
            return false;
        };
    }
    
    function getVariants(str) {
        let values = [],
            value = '',
            skip = 0,
            position = 0;
        
        for (let i = 0; i < str.length; i++) {
            if (str[i] === ',' && !skip) {
                values.push(new getArray(value, true));
                value = '';
            } else {
                value += str[i];
                if (str[i] === '{')
                    skip++;
                if (str[i] === '}')
                    skip--;
            }
        }
        values.push(new getArray(value, true));
        
        this.current = function() {
            return values[position].current();
        };
        
        this.next = function() {
            if (values[position].next())
                return true;
            position++;
            if (position < values.length)
                return true;
            else
                position = 0;
            return false;
        };
    }
    
    let arr = new getArray(str, false);
    
    do {
        yield arr.current();
    }
    while (arr.next());
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    throw new Error('Not implemented');
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    throw new Error('Not implemented');
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    throw new Error('Not implemented');
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
