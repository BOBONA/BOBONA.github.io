function copyToClipboard() {
    navigator.clipboard.writeText(document.getElementById("output").innerText);
}

function appendTable(name, headers, data) {
    let h3 = document.createElement("h3");
    let h3Text = document.createTextNode(name);
    h3.appendChild(h3Text);
    document.body.appendChild(h3);
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
            let text = document.createTextNode(data[i][h]);
            td.appendChild(text);
            row.appendChild(td);
        }
        table.append(row);
    }
    document.body.appendChild(table);
}

function displayData(data) {
    document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    document.getElementById("copy").style.display = "inline-block";
    appendTable("Average message counts per month: ",
                ["Month"].concat(Object.keys(data.months[0][1])),
                data.months.map((m) => [m[0]].concat(Object.values(m[1]))));
    appendTable("Message counts per user: ",
                ["User"].concat(Object.keys(data.users[0][1].messageCountMonthly)),
                data.users.map((u) => [u[0]].concat(Object.values(u[1].messageCountMonthly))));
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

function getMonth(date) {
    return (date.getMonth() + 1) + "/" + date.getFullYear()
}

function process(messages) {
    let monthsList = getLastMonths(12);
    let messageCountMonthly = {};
    let months = {}
    for (let i in monthsList) {
        let month = monthsList[i];
        months[month] = {
            average: 0,
            averagePercentile50: 0,
            averagePercentile75: 0,
        }
        messageCountMonthly[month] = 0;
    }
    let users = {};
    for (let i in messages) {
        let message = messages[i];
        if (!(message.author in users)) {
            users[message.author] = {
                messageCountMonthly: {},
            };
            Object.assign(users[message.author].messageCountMonthly, messageCountMonthly);
        }
        let month = getMonth(message.date);
        if (month in users[message.author].messageCountMonthly) {
            users[message.author].messageCountMonthly[month]++;
            months[month].average++;
        }
    }
    let userArray = [];
    for (let i in monthsList) {
        let month = monthsList[i];
        months[month].average = Math.round(months[month].average / Object.keys(users).length);
        let userList = Object.keys(users).map((key) => {
            return [key, users[key]];
        });
        userList.sort((u1, u2) => {
            return u2[1].messageCountMonthly[month] - u1[1].messageCountMonthly[month];
        });
        var sliced50 = userList.slice(0, Math.floor(userList.length * (1 - 0.5)));
        months[month].averagePercentile50 = Math.round(sliced50
                                        .reduce((ac, user) => ac + user[1].messageCountMonthly[month], 0) / sliced50.length);
        var sliced75 = userList.slice(0, Math.floor(userList.length * (1 - 0.75)));
        months[month].averagePercentile75 = Math.round(sliced75
                                        .reduce((ac, user) => ac + user[1].messageCountMonthly[month], 0) / sliced75.length);
        if (i == monthsList.length - 1) {
            userArray = userList;
        }
    }
    let monthArray = [];
    for (let i in monthsList) {
        monthArray.push([monthsList[i], months[monthsList[i]]]);
    }
    displayData({months: monthArray, users: userArray});
}

function read(file) {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event) => {
        whatsappChatParser
            .parseString(event.target.result)
            .then(messages => {
                process(messages);
            })
            .catch(err => {
                console.log(err);
            });
    };
    reader.onerror = (event) => {
        console.log(error);
    };
}

function buttonPressed() {
    let file = document.getElementById("logInput").files[0];
    if (file) {
        read(file);
    }
}
