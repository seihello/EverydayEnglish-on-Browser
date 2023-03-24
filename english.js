let csv = new XMLHttpRequest()

csv.open("GET", "english.csv", false)
 
try {
  csv.send(null);
} catch (err) {
  console.log(err);
}

let lines = csv.responseText.split(/\r\n|\n/);

for(let i = 1; i < 10; i++) {
    console.log(lines[i])
}