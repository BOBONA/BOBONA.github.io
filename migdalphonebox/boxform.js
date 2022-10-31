const times = [
    ["Shacharit", 7, 25],
    ["Morning+Seder", 8, 40],
    ["Mincha+%26+Afternoon Seder", 14, 55],
    ["Night+Seder+%26+Arvit", 19, 10]
];

const urlParams = new URLSearchParams(window.location.search);
const inOrOut = urlParams.get("where");
const phones = JSON.parse(urlParams.get("phones"));
const apartment = urlParams.get("apartment");
const name = urlParams.get("name");

const now = new Date();
const minutes = now.getHours() * 60 + now.getMinutes();
let time = times[times.length - 1][0];
let phone = phones[times.length - 1];
for (let i = 0; i < times.length - 1; i++) {
    if (times[i][1] * 60 + times[i][2] <= minutes && minutes <= times[i + 1][1] * 60 + times[i + 1][2]) {
        time = times[i][0];
        phone = phones[i];
        break;
    }
}

window.location.replace(`https://docs.google.com/forms/d/e/1FAIpQLSeFJtI88ikOhZtVZsL9ucO0vkiHScSzqAbRI2L0HpU8r1baLQ/formResponse?&submit=Submit&` +
    `entry.1667978196=${time}&entry.1552564986=${inOrOut}&entry.1607898137=${phone ? "Yes" : "No"}&entry.551232803=${apartment}&entry.1130957596=${name}`);
