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

const ids = {
    "39": "570713596",
    "49": "865593227",
    "27": "2107477704",
    "23": "1736851528",
    "35": "237174216",
    "14": "1319684264"
}

window.location.replace(`https://docs.google.com/forms/d/e/1FAIpQLScTZluOOu2J87HRLBj7FZ_zVqZpZQ8Az9YtEiUaEzlcI3tLjg/formResponse?&submit=Submit&` +
    `entry.275193204=${time}&entry.1682337327=${inOrOut}&entry.2096638216=${phone ? "Yes" : "No"}&entry.115186426=${apartment}&entry.${ids[apartment]}=${name}`);
