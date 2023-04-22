let switchWordValidColor
let switchWordInvalidColor

let csv = new XMLHttpRequest()

csv.open("GET", "english.csv", false)
 
try {
  csv.send(null);
} catch (err) {
  console.log(err);
}

let wordTable = CSVToArray(csv.responseText)
let indexes = []
let currentIndex = -1
let currentLevels = [1, 2, 3, 4, 5]

showNextWord()



$(function() {
  $("#switch-word-buttons").children().eq(0).on("click", showPreviousWord)
  $("#switch-word-buttons").children().eq(1).on("click", showNextWord)
  $("article").children().on("click", (e) => {
    e.preventDefault()
  })
  switchWordValidColor = $("#next-word").css("color")
  switchWordInvalidColor = $("#previous-word").css("color")

  $("#apply-button").on("click", () => {
    currentLevels = []
    $("input[name=level]:checked").each((index, checkedLevel) => {
      currentLevels.push(Number($(checkedLevel).val()))
    })
    resetWords()
    showNextWord()
  })
})

function resetWords() {
  indexes = []
  currentIndex = -1
}

function showPreviousWord() {
  if(currentIndex === 0) {
    return
  }
  currentIndex--
  let word = getWordByIndex(indexes[currentIndex])
  $(".word-titles").html(word.titles)
  $(".word-meanings").html(word.meanings)
  $(".word-sentences").html(word.sentences)

  setSwitchWordButtonColor()
}

function showNextWord() {
  let word;
  if(currentIndex === indexes.length - 1) {
    word = getNewWord()
    indexes.push(word.index)
    currentIndex++
  } else {
    currentIndex++
    word = getWordByIndex(indexes[currentIndex])
  }
  $(".word-titles").html(word.titles)
  $(".word-meanings").html(word.meanings)
  $(".word-sentences").html(word.sentences)

  setSwitchWordButtonColor()
}

function getNewWord() {

  while(true) {
    let newIndex = Math.floor(Math.random() * (wordTable.length-3)) + 3
    let newWord = {
      index: newIndex,
      titles: wordTable[newIndex][1].replace(/\n|\r\n/g, "<br>"),
      meanings: wordTable[newIndex][2].replace(/\n|\r\n/g, "<br>"),
      sentences: wordTable[newIndex][3].replace(/\n|\r\n/g, "<br>")
    }
    
    const level = Number(wordTable[newIndex][6].replace(/\n|\r\n/g, "<br>"))
    if(currentLevels.includes(level)) {
      return newWord
    } else {
      continue
    }
  }
}

function getWordByIndex(index) {
  let word = {
    index: index,
    titles: wordTable[index][1].replace(/\n|\r\n/g, "<br>"),
    meanings: wordTable[index][2].replace(/\n|\r\n/g, "<br>"),
    sentences: wordTable[index][3].replace(/\n|\r\n/g, "<br>")
  }
  return word
}

function setSwitchWordButtonColor() {
  if(currentIndex === 0) {
    $("#previous-word").css("color", switchWordInvalidColor)
  } else {
    $("#previous-word").css("color", switchWordValidColor)
  }
}

// https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
function CSVToArray (CSV_string) {
    delimiter = (","); // user-supplied delimeter or default comma
 
    var pattern = new RegExp( // regular expression to parse the CSV values.
      ( // Delimiters:
        "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + delimiter + "\\r\\n]*))"
      ), "gi"
    );
 
    var rows = [[]];  // array to hold our data. First row is column headers.
    // array to hold our individual pattern matching groups:
    var matches = false; // false if we don't find any matches
    // Loop until we no longer find a regular expression match
    while (matches = pattern.exec( CSV_string )) {
        var matched_delimiter = matches[1]; // Get the matched delimiter
        // Check if the delimiter has a length (and is not the start of string)
        // and if it matches field delimiter. If not, it is a row delimiter.
        if (matched_delimiter.length && matched_delimiter !== delimiter) {
          // Since this is a new row of data, add an empty row to the array.
          rows.push( [] );
        }
        var matched_value;
        // Once we have eliminated the delimiter, check to see
        // what kind of value was captured (quoted or unquoted):
        if (matches[2]) { // found quoted value. unescape any double quotes.
         matched_value = matches[2].replace(
           new RegExp( "\"\"", "g" ), "\""
         );
        } else { // found a non-quoted value
          matched_value = matches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        rows[rows.length - 1].push(matched_value);
    }
    return rows; // Return the parsed data Array
 }