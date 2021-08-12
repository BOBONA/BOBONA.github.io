function copyToClipboard() {
    navigator.clipboard.writeText(document.getElementById("output").innerText);
}

function downloadCsv(name, headers, data) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    for (let i in data) {
        let row = [];
        for (let j in headers) {
            row.push(data[i][headers[j]]);
        }
        csvContent += row.join(",") + "\r\n";
    }
    saveAs(csvContent, name + ".csv");
}

function appendTable(name, headers, data) {
    let h3 = document.createElement("h3");
    let h3Text = document.createTextNode(name);
    h3.appendChild(h3Text);
    document.body.appendChild(h3);
    let exportBtn = document.createElement("button");
    exportBtn.onclick = () => {
        downloadCsv(name, headers, data);
    };
    let buttonText = document.createTextNode("Export CSV");
    exportBtn.appendChild(buttonText);
    document.body.appendChild(exportBtn);
    let table = document.createElement("table");
    let header = document.createElement("tr");
    for (let h in headers) {
        let th = document.createElement("th");
        let text = document.createTextNode(headers[h]);
        th.appendChild(text);
        header.appendChild(th);
    }
    table.append(header);
    for (let i in data) {
        let row = document.createElement("tr");
        for (let h in headers) {
            let td = document.createElement("td");
            let text = document.createTextNode(data[i][headers[h]]);
            td.appendChild(text);
            row.appendChild(td);
        }
        table.append(row);
    }
    document.body.appendChild(table);
}

function displayData(data, messages) {
    document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    document.getElementById("copy").style.display = "inline-block";
    document.getElementById("chatExport").style.display = "inline-block";
    document.getElementById("chatExport").onclick = () => {
        downloadCsv("log", ["author", "date", "chat", "message"], messages);
    }
    appendTable("Average messages: ",
                ["Month", "aveMessage", "aveMessageP50", "aveMessageP75"],
                data.months.map((m) => Object.assign({}, {"Month": m[0]}, m[1])));
    appendTable("Message count per user: ",
                ["User"].concat(Object.keys(data.users[0][1].monthlyMessageCount)),
                data.users.map((u) => Object.assign({}, {"User": u[0]}, u[1].monthlyMessageCount)));
    appendTable("Average touch points: ",
                ["Month", "aveContact", "aveContactP50", "aveContactP75"],
                data.months.map((m) => Object.assign({}, {"Month": m[0]}, m[1])));
    appendTable("Touch points per user: ",
                ["User"].concat(Object.keys(data.users[0][1].monthlyContactCount)),
                data.users.map((u) => Object.assign({}, {"User": u[0]}, u[1].monthlyContactCount)));
}

function getLastMonths(count) {
    let months = [];
    let d = new Date();
    for (let i = 0; i < count; i++) {
        let m = d.getMonth();
        d.setMonth(d.getMonth() - 1);
        if (d.getMonth() == m) d.setDate(0);
        months.push(getMonth(d));
    }
    return months;
}

function getAverageInBracket(users, month, sortWith, bracketStart, bracketEnd) {
    users.sort((u1, u2) => {
        return u2[1][sortWith][month] - u1[1][sortWith][month];
    });
    let sliced = users.slice(bracketStart, Math.floor(users.length * bracketEnd));
    return Math.round(sliced.reduce((ac, user) => ac + user[1][sortWith][month], 0) / sliced.length);
}

function getMonth(date) {
    return (date.getMonth() + 1) + "/" + date.getFullYear();
}

function getDay(date) {
    return (date.getMonth() + 1) + "/" + date.getFullYear() + "/" + date.getDate();
}

function process(messages) {
    let monthsList = getLastMonths(12);
    let monthlyCountObject = {};
    let months = {}
    for (let i in monthsList) {
        let month = monthsList[i];
        months[month] = {
            aveMessage: 0,
            aveMessageP50: 0,
            aveMessageP75: 0,
            aveContact: 0,
            aveContactP50: 0,
            aveContactP75: 0,
        }
        monthlyCountObject[month] = 0;
    }
    let users = {};
    for (let i in messages) {
        let message = messages[i];
        if (!(message.author in users)) {
            users[message.author] = {
                monthlyMessageCount: {},
                monthlyContactCount: {},
                messageDays: {},
            };
            Object.assign(users[message.author].monthlyMessageCount, monthlyCountObject);
            Object.assign(users[message.author].monthlyContactCount, monthlyCountObject);
        }
        let month = getMonth(message.date);
        if (month in users[message.author].monthlyMessageCount) {
            users[message.author].monthlyMessageCount[month]++;
            months[month].aveMessage++;
            let day = getDay(message.date) + "//" + message.chat;
            if (day in users[message.author].messageDays) {
                users[message.author].messageDays[day]++;
            } else {
                users[message.author].messageDays[day] = 1;
                users[message.author].monthlyContactCount[month]++;
                months[month].aveContact++;
            }
        }
    }
    let userArray = [];
    for (let i in monthsList) {
        let month = monthsList[i];
        months[month].aveMessage = Math.round(months[month].aveMessage / Object.keys(users).length);
        months[month].aveContact = Math.round(months[month].aveContact / Object.keys(users).length);
        let userList = Object.keys(users).map((key) => {
            return [key, users[key]];
        });
        months[month].aveMessageP50 = getAverageInBracket(userList, month, "monthlyMessageCount", 0, 0.5);
        months[month].aveMessageP75 = getAverageInBracket(userList, month, "monthlyMessageCount", 0, 0.25);
        months[month].aveContactP50 = getAverageInBracket(userList, month, "monthlyContactCount", 0, 0.5);
        months[month].aveContactP75 = getAverageInBracket(userList, month, "monthlyContactCount", 0, 0.25);
        if (i == monthsList.length - 1) {
            userArray = userList;
        }
    }
    let monthArray = [];
    for (let i in monthsList) {
        monthArray.push([monthsList[i], months[monthsList[i]]]);
    }
    displayData({months: monthArray, users: userArray}, messages);
}

function getMessagesFromFile(file, then) {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event) => {
        whatsappChatParser
            .parseString(event.target.result)
            .then(then)
            .catch(err => {
                console.log(err);
            });
    };
    reader.onerror = (event) => {
        console.log(error);
    };
}

function buttonPressed() {
    let files = document.getElementById("logInput").files;
    let messages = [];
    let finished = 0;
    for (let i in files) {
        let file = files[i];
        if (typeof(file) === "object") {
            getMessagesFromFile(file, (messageList) => {
                let chat = messageList[0].message.includes("WhatsApp") ? messageList[0].author : file.name;
                messages = messages.concat(messageList.map((m) => {
                    m.chat = chat;
                    return m;
                }));
                finished++;
                if (finished === files.length) {
                    process(messages);
                }
            });
        }
    }
}
