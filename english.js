let switchWordValidColor = ""
let switchWordInvalidColor = ""
let indexes = []
let currentIndex = -1
let tags = []
let isMobile = false
let favoriteIndex = []


let filter = {
  tags: [],
  levels: [1, 2, 3, 4, 5],
  favorites: {favorite: false, nonfavorite: false}
}

const wordTable = getWordTable()

$(function() {

  extractTags()
  loadUserSetting()
  applyUserSettingToCheckbox()
  getAppliedWords()
  showNextWord()

  $("#switch-word-buttons").children().eq(0).on("click", showPreviousWord)
  $("#switch-word-buttons").children().eq(1).on("click", showNextWord)
  $("article").children().on("click", (e) => {
    e.preventDefault()
  })
  switchWordValidColor = $("#next-word").css("color")
  switchWordInvalidColor = $("#previous-word").css("color")

  if($("aside").css("display") === "none") {
    isMobile = true
  } else {
    isMobile = false
  }

  $("input[name=tag-all]").on("click", () => {
    $("input[name=tag]").prop("checked", $("input[name=tag-all]").prop("checked"))
  })
  $("input[name=tag]").on("click", () => {
    toggleSelectAllCheckbox()
  })
  $("input[name=level-all]").on("click", () => {
    $("input[name=level]").prop("checked", $("input[name=level-all]").prop("checked"))
  })
  $("input[name=level]").on("click", () => {
    toggleSelectAllCheckbox()
  })

  $("#apply-button").on("click", updateWords)

  $("#filter-img").on("click", () => {
    $("aside").slideDown(200)
  })
  $("#close-img").on("click", () => {
    $("aside").slideUp(200)
  })


  $("#favorite-image").on("click", () => {
    const indexOfDisplayedWord = favoriteIndex.indexOf(indexes[currentIndex])
    if(indexOfDisplayedWord !== -1) {
      favoriteIndex.splice(indexOfDisplayedWord, 1)
    } else {
      favoriteIndex.push(indexes[currentIndex])
    }
    updateFavoriteIcon(getWordByIndex(indexes[currentIndex]).index)
    storeFavoriteWords()
  })
})

function updateWords() {
  filter.levels = []
  $("input[name=level]:checked").each((index, checkedLevel) => {
    filter.levels.push(Number($(checkedLevel).val()))
  })
  filter.tags = []
  $("input[name=tag]:checked").each((index, checkedTag) => {
    filter.tags.push($(checkedTag).val())
  })
  filter.favorites.favorite = $("input[name=favorite]").prop("checked")
  filter.favorites.nonfavorite = $("input[name=not-favorite]").prop("checked")

  resetWords()
  getAppliedWords()
  showNextWord()
  storeUserSetting()

  if(isMobile) {
    $("aside").css("display", "none")
  }
}

function resetWords() {
  indexes = []
  currentIndex = -1
}

function showPreviousWord() {
  if(currentIndex - 1 >= 0) {
    currentIndex--
    setWordToElement(getWordByIndex(indexes[currentIndex]))
  }
  updateFavoriteIcon(indexes[currentIndex])
  setSwitchWordButtonColor()
}

function showNextWord() {
  if(currentIndex + 1 < indexes.length) {
    currentIndex++
    setWordToElement(getWordByIndex(indexes[currentIndex]))
  }
  updateFavoriteIcon(indexes[currentIndex])
  setSwitchWordButtonColor()
}

function setWordToElement(word) {
  console.log(word)
  $(".word-tags").empty()
  for(const tag of word.tags) {
    if(tag !== "") {
      const wordTagElement = document.createElement("div")
      wordTagElement.classList.add("word-tag")
      wordTagElement.innerText = tag
      $(".word-tags").append(wordTagElement)
    }
  }
  $(".word-titles").html(word.titles)
  $(".word-meanings").html(word.meanings)
  $(".word-sentences").html(word.sentences)
}

function getAppliedWords() {
  indexes = []

  for(wordLine in wordTable) {
    // Ignore the header of the file
    if(wordLine <= 1) {
      continue
    }
    const word = getWordByIndex(Number(wordLine))
    if(meetsFilterConditions(word)) {
      indexes.push(Number(wordLine))
    }
  }

  indexes = shuffle(indexes)
}

function getWordByIndex(index) {
  let word = {
    index: index,
    titles: wordTable[index][1].replace(/\n|\r\n/g, "<br>"),
    meanings: wordTable[index][2].replace(/\n|\r\n/g, "<br>"),
    sentences: wordTable[index][3].replace(/\n|\r\n/g, "<br>"),
    level: Number(wordTable[index][6].replace(/\n|\r\n/g, "<br>")),
    tags: wordTable[index][5].replace(/\n|\r\n/g, "<br>").split("、")
  }
  return word
}

function setSwitchWordButtonColor() {
  if(currentIndex === 0) {
    $("#previous-word").css("color", switchWordInvalidColor)
  } else {
    $("#previous-word").css("color", switchWordValidColor)
  }
  if(currentIndex === indexes.length - 1) {
    $("#next-word").css("color", switchWordInvalidColor)
  } else {
    $("#next-word").css("color", switchWordValidColor)
  }
}

function getWordTable() {
  let csv = new XMLHttpRequest()
  csv.open("GET", "english.csv", false)
  
  try {
    csv.send(null);
  } catch (err) {
    console.log(err);
  }
  
  let table = CSVToArray(csv.responseText)
  return table
}

function extractTags() {
  for(wordLine in wordTable) {
    // Ignore the header of the file
    if(wordLine <= 1) {
      continue
    }
    const tagsText = wordTable[wordLine][5].replace(/\n|\r\n/g, "<br>")
    if(tagsText === "") {
      if(!tags.includes("")) {
        tags.unshift("")
      }
    }
    tagsArray = tagsText.split("、")
    for(const tag of tagsArray) {
      if(!tags.includes(tag)) {
        tags.push(tag)
      }
    }
  }

  tags.forEach((tag, index) => {
    if(tag !== "") {
      const newElementStr = `<label for="tag${index}"><input type="checkbox" name="tag" id="tag${index}" value="${tag}" checked>${tag}</label>`
      $("#tag-filter").append($(newElementStr))
    } else {
      const newElementStr = `<label for="tag${index}"><input type="checkbox" name="tag" id="tag${index}" value="${tag}" checked>タグなし</label>`
      $("#tag-filter").append($(newElementStr))
    }
  })

  filter.tags = [...tags]
}

function meetsFilterConditions(word) {
  if(filter.levels.length === 0 || filter.tags.length === 0) {
    return false
  }
  if(filter.levels.includes(word.level)) {
    for(const wordTag of word.tags) {
      if(filter.tags.includes(wordTag)) {
        return meetsFavorite(word)
      }
    }
  }

  return false
}

function meetsFavorite(word) {
  if(filter.favorites.favorite && favoriteIndex.includes(word.index)) {
    return true
  } else if(filter.favorites.nonfavorite && !favoriteIndex.includes(word.index)) {
      return true
  } else {
    return false
  }
}

function applyUserSettingToCheckbox() {
  $("input[name=level]").each((index, levelElement) => {
    if(filter.levels.includes(Number($(levelElement).val()))) {
      $(levelElement).prop("checked", true)
    } else {
      $(levelElement).prop("checked", false)
    }
  })
  $("input[name=tag]").each((index, tagElement) => {
    if(filter.tags.includes($(tagElement).val())) {
      $(tagElement).prop("checked", true)
    } else {
      $(tagElement).prop("checked", false)
    }
  })
  $("input[name=favorite]").prop("checked", filter.favorites.favorite)
  $("input[name=not-favorite]").prop("checked", filter.favorites.nonfavorite)

  toggleSelectAllCheckbox()
}

function storeUserSetting() {
  localStorage.setItem("filter", JSON.stringify(filter))
}

function storeFavoriteWords() {
  localStorage.setItem("favorite-words", JSON.stringify(favoriteIndex))
}

function loadUserSetting() {
  let filterJSON = localStorage.getItem("filter")

  // If data exists
  if(filterJSON !== null) {
    filter = JSON.parse(filterJSON)
  }
}

function toggleSelectAllCheckbox() {
  if($("input[name=level]:checked").length === 5) {
    $("input[name=level-all]").prop("checked", true)
  } else {
    $("input[name=level-all]").prop("checked", false)
  }

  if($("input[name=tag]:checked").length === tags.length) {
    $("input[name=tag-all]").prop("checked", true)
  } else {
    $("input[name=tag-all]").prop("checked", false)
  }
}

function updateFavoriteIcon(index) {
  if(favoriteIndex.includes(index)) {
    $("#favorite-image").prop("src", "img/favorite.png")
  } else {
    $("#favorite-image").prop("src", "img/not-favorite.png")
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

 // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

