import { call } from "/node.js";
const colorThief = new ColorThief();

async function recieve(message) {
    try {
        const result = await call(message)
        let HTMLresult = marked.parse(result)
        document.body.innerHTML = HTMLresult
    } catch (error) {
        console.error("Error calling API:", error);
    }
}

document.addEventListener("dblclick", function () {
    console.log("doubleclick");
});

function send(message) {
    recieve(message)
}

window.send = send

document.querySelector("img").crossOrigin = "anonymous";

document.querySelector("img").addEventListener("load", function () {
    console.log(colorThief.getColor(document.querySelector("img")))
})