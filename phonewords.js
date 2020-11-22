//------------------//
// GLOBALS          //
//------------------//
const fs = require('fs'); // FILE SYSTEM PACKAGE
const phoneFile = process.argv[2];
const dictionaryFile = process.argv[4];

let input; // PHONE NUMBERS
let dictionary; // PHONE WORDS

const keyboard = [
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['G', 'H', 'I'],
  ['J', 'K', 'L'],
  ['M', 'N', 'O'],
  ['P', 'Q', 'R', 'S'],
  ['T', 'U', 'V'],
  ['W', 'X', 'Y', 'Z']
];

//------------------//
// HELPER FUNCTIONS //
//------------------//

const getPossibleWords = inputNumber => {
  let outputWords = [];

  if (Number(inputNumber)) {
    [...inputNumber].forEach(number => {
      const key = keyboard[number - 2];
  
      if (!outputWords.length) {
        outputWords = key;
      } else {
        const newWords = [];
        key.forEach(keyCharacter => {
          outputWords.forEach(word => {
            newWords.push(word + keyCharacter);
          });
        });
        outputWords = newWords;
      }
    });
  }

  return outputWords;
}

// (Not mine) Got this cartesian code from https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);
//----------------------------------------------------------------------//

const getFormattedPhoneWord = segmentsToCheck => {
  return cartesian(...segmentsToCheck).map(segment => segment.toString().replace(/,/g, '-'));
}

//------------------//
// GO!              //
//------------------//


if (process.argv.length < 5 || process.argv[3] !== '-d') { // Make sure the exact arguments are provided
  console.log('Please use correct syntax: node phonewords {PHONE_FILE} -d {DICTIONARY_FILE}');
  process.exit(1);
}
  
fs.readFile(phoneFile, 'utf8', (err, phonesData) => {
  if (err) throw err;
  if (phonesData) {
    // Load phone file and transform to array
    input = phonesData.split(/(?:\r\n|\r|\n)/g);

    fs.readFile(dictionaryFile, 'utf8', (err, dictionaryData) => {
      // Load dictionary file and transform to array
      if (err) throw err;
      if (dictionaryData) {
        dictionary = dictionaryData.split(/(?:\r\n|\r|\n)/g).map(word => word.toUpperCase());

        const phoneWords = [];
    
        input.forEach(inputNumber => {
          const hasLetters = /[a-zA-Z]/g;
        
          if (!hasLetters.test(inputNumber)) { // Omit any phones with letters
            const splittedNumber = inputNumber.split(/[^\w]/g); // Format number segments into array elements
        
            const segmentsToCheck = [];
            
            // Check segments
            splittedNumber.forEach(segment => {
              const possibleWords = getPossibleWords(segment).filter(possibleWord => dictionary.filter(word => word === possibleWord).length);
              
              // Add either possible word or keep number segment
              segmentsToCheck.push(possibleWords.length ? possibleWords : [segment]);
            });
          
            // FORMAT OUTPUT
            const foundInputNumber = phoneWords.find(phoneWord => phoneWord.inputNumber === inputNumber);
          
            if (hasLetters.test(segmentsToCheck) && cartesian(...segmentsToCheck)) { // Remove any non phoneword number
              if (foundInputNumber) {
                // Add combination to existing number
                foundInputNumber.phoneWords = getFormattedPhoneWord(segmentsToCheck);
              } else {
                // Add first combination to non existing number
                phoneWords.push({
                  inputNumber,
                  phoneWords: getFormattedPhoneWord(segmentsToCheck)
                });
              }
            }
          }
        });
        
        // OUTPUT RESULT TO TERMINAL AS { inputNumber: string; phoneWords: string[] }
        console.dir(phoneWords, {depth: null});
        return phoneWords;
      } else {
        throw 'Dictionary file should not be empty!';
      }
    });
    
  } else {
    throw 'Phones file should not be empty!';
  }
});