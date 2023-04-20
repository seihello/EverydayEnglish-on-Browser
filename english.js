$(function() {
  console.log("start to prepare")
  $("#switch-word-buttons").children().eq(1).on("click", changeWord)
})



let csv = new XMLHttpRequest()

csv.open("GET", "english.csv", false)
 
try {
  csv.send(null);
} catch (err) {
  console.log(err);
}

let lines = CSVToArray(csv.responseText)

changeWord()

function changeWord() {
    // Get a line at ramdom
    let index = Math.floor(Math.random() * (lines.length-3)) + 3

    let titlesElement = document.querySelector(".word-titles")
    titlesElement.innerHTML = lines[index][1].replace(/\n|\r\n/g, "<br>")

    let meaningsElement = document.querySelector(".word-meanings")
    meaningsElement.innerHTML = lines[index][2].replace(/\n|\r\n/g, "<br>")

    let sentencesElement = document.querySelector(".word-sentences")
    sentencesElement.innerHTML = lines[index][3].replace(/\n|\r\n/g, "<br>")
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