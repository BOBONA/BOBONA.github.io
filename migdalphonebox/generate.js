function generate() {
    const inOrOut = document.getElementById("inOrOut").checked ? "IN" : "OUT";
    const shacharit = document.getElementById("shacharit").checked;
    const morning = document.getElementById("morning").checked;
    const afternoon = document.getElementById("afternoon").checked;
    const night = document.getElementById("night").checked;
    const apartment = document.getElementById("apartment").value;
    const name = document.getElementById("name").value;

    const text = document.getElementById("link");
    const link = `https://bobona.github.io/migdalphonebox/submit.html` +
    `?where=${inOrOut}&phones=${JSON.stringify([shacharit, morning, afternoon, night])}&apartment=${apartment}&name=${name}`
    text.href = link;
    text.children[0].innerHTML = link;
}
