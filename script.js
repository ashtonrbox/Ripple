// Imports & Variables

import { call } from "./pnode.js";
const colorThief = new ColorThief();

async function saveImage(imageUrl) {
    const result = await window.electronAPI.downloadImage(imageUrl)
    if (result.success) {
        console.log(result.filePath)
        return result.filePath
    }
}
window.si = saveImage

async function recieve(message) {
    try {
        const result = await call(message)
        let HTMLresult = marked.parse(result)
        document.body.innerHTML = HTMLresult
    } catch (error) {
        console.error("Error calling API:", error);
    }
}
window.recieve = recieve

let publicStorage = JSON.parse(localStorage.getItem("ripple_data"))
function storage(method, key, value) {
    switch (method) {
        case "display": {
            console.log(publicStorage)
            break
        }
        case "clear": {
            publicStorage = {
                "ripples": {}
            }
            localStorage.setItem("ripple_data", JSON.stringify(publicStorage))
            break
        }
        case "update": {
            publicStorage[key] = value
            localStorage.setItem("ripple_data", JSON.stringify(publicStorage))
            break
        }
        case "ripple": {
            publicStorage["ripples"][key] = value
            localStorage.setItem("ripple_data", JSON.stringify(publicStorage))
            break
        }
        case "wipe": {
            publicStorage = key
            localStorage.setItem("ripple_data", JSON.stringify(publicStorage))
            break
        }
        case "return": {
            return key ? publicStorage[key] : publicStorage
        }
    }
}
window.s = storage

if (!publicStorage || publicStorage === null) {
    publicStorage = {
        "ripples": {}
    }
    storage("wipe", publicStorage)
}

function makeDraggable(popupEl) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    popupEl.querySelector(".dragHeader").addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetX = e.clientX - popupEl.offsetLeft;
        offsetY = e.clientY - popupEl.offsetTop;
        popupEl.querySelector(".dragHeader").style.cursor = "grabbing";
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            const padding = 16;
            const maxX = window.innerWidth - popupEl.offsetWidth - padding;
            const maxY = window.innerHeight - popupEl.offsetHeight - padding;

            x = Math.max(padding, Math.min(x, maxX));
            y = Math.max(padding, Math.min(y, maxY));

            popupEl.style.left = x + 'px';
            popupEl.style.top = y + 'px';
        }
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            popupEl.querySelector(".dragHeader").style.cursor = "grab";
        }
    });
}
document.getElementById("popups")?.querySelectorAll(".popup").forEach(makeDraggable)

function createID() {
    let stamp = new Date().toLocaleTimeString()

    let identifyString = "";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 20; i++) {
        identifyString += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return (`RIPPLE_${stamp}_${identifyString}`);
}

let regPopup = "none";

/*document.querySelector("img").crossOrigin = "anonymous";

document.querySelector("img").addEventListener("load", function () {
    console.log(colorThief.getColor(document.querySelector("img")))
    document.body.style.backgroundColor = `rgb(${colorThief.getColor(document.querySelector("img"))})`;

    let string = "An abstract, emotional background made of soft, blurred gradients in [color 1], [color 2], and [color 3]. The image is minimalistic and grainy, with subtle aesthetic details like faint lines, fine grain, soft dots, or ripple patterns, inspired by ambient light, film textures, and analog photography. Dreamlike and atmospheric. | https://image.pollinations.ai/prompt/An%20abstractbackground%20with%20several%20flowers%20filling%20the%20canvas.%20flowers%20and%20grass.%20Flowers%20should%20be%20at%20the%20top%20of%20the%20image%20and%20using%20a%20moody,%20elegant%20red%20The%20image%20is%20minimalistic%20and%20grainy,%20with%20subtle%20aesthetic%20details%20like%20faint%20lines,%20fine%20grain,%20soft%20dots,%20or%20ripple%20patterns,%20inspired%20by%20ambient%20light,%20film%20textures,%20and%20analog%20photography.%20Dreamlike%20and%20atmospheric."
})*/

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup !== "none") {
        popup("close")
    }
});

const popups = document.getElementById("popups")
popups.addEventListener("mousedown", function (e) {
    if (regPopup !== "none" && !e.target.closest(".popup") && e.target.id !== "add") {
        popup("close")
    }
});

function popup(method, popup, cords) {
    if (method === "show") {
        popups.style.display = "block";

        let toShow = document.getElementById(popup)
        regPopup = popup;

        toShow.style.display = "block";
        toShow.style.left = `${Number(cords[0]) - 270}px`;
        toShow.style.top = `${Number(cords[1]) - 410}px`;

        requestAnimationFrame(() => {
            const rect = toShow.getBoundingClientRect();
            const padding = 16;

            let newLeft = rect.left;
            let newTop = rect.top;

            if (rect.right > window.innerWidth) {
                newLeft = window.innerWidth - rect.width - padding;
            }
            if (rect.bottom > window.innerHeight) {
                newTop = window.innerHeight - rect.height - padding;
            }
            if (rect.left < 0) {
                newLeft = padding;
            }
            if (rect.top < 0) {
                newTop = padding;
            }

            toShow.style.left = newLeft + "px";
            toShow.style.top = newTop + "px";
        });

    } else {
        popups.style.display = "none";

        regPopup = "none";
        document.getElementById("popups").querySelectorAll(".popup").forEach(popup => {
            popup.style.display = "none";
        })
    }
}

const options = document.querySelectorAll("#options h5");
const slide = document.querySelector(".slide");

function moveSlide(location) {
    if (location === 0) {
        slide.style.transform = "translateY(0px)";
    } else {
        slide.style.transform = "translateY(27px)";
    }
    slide.id = `slide${location}`
}

options.forEach((option, i) => {
    option.addEventListener("click", () => moveSlide(i));
});

moveSlide(0, true);


// Start Up

const ripplesContainer = document.getElementById("ripples");
const add = document.getElementById("add");

let ripples = document.querySelectorAll(".ripple");

let ripplesAmnt = Object.keys(storage("return", "ripples")).length

add.addEventListener("click", function (e) {
    /*//! DUMMY ADD, FIX LATER

    let id = createID();
    let newRipple = {
        "title": "ripple",
        "date": new Date().toISOString(),
        "content": "test",
        "reflection": "test",
        "image": "?",
        "color": "#000000"
    }

    storage("ripple", id, newRipple)*/

    if (popup === "create") {
        popup("close")
    } else {
        popup("show", "create", [e.clientX, e.clientY])
    }

})

if (ripplesAmnt > 0) {

    add.style.display = "none";

    const ripplesRaw = Object.entries(storage("return", "ripples"));
    const toDraw = ripplesRaw.sort((a, b) => {
        return new Date(a[1].date) - new Date(b[1].date);
    });

    const speed = 250;

    const nonAnimated = toDraw.slice(0, Math.max(0, toDraw.length - 11));
    const animate = toDraw.slice(-11);
    let animLength = Object.keys(animate).length

    nonAnimated.forEach(([id, data], index) => {
        let craft = createRipple(id, data, false)
        ripplesContainer.insertBefore(craft, add)
    })

    animate.forEach(([id, data], index) => {
        setTimeout(() => {
            let craft = createRipple(id, data, true)
            ripplesContainer.insertBefore(craft, add)
            ripplesContainer.scrollTo({
                top: ripplesContainer.scrollHeight,
                behavior: "smooth"
            });
        }, index * speed)
    })

    setTimeout(() => {
        add.classList.add("animatedRipple");
        add.style.display = "flex";
    }, (animLength * speed) + speed);

}

function createRipple(id, data, animate) {

    let rippleContainer = document.createElement("div")
    rippleContainer.classList.add("ripple")

    let fallback = document.createElement("div")
    fallback.classList.add("fallback")

    let background = document.createElement("div")
    background.classList.add("background")
    //! ADD BACKGROUND COLOR

    let design = document.createElement("div")
    design.classList.add("design")

    let top = document.createElement("div")
    top.classList.add("top")

    let blend = document.createElement("div")
    blend.classList.add("blend")
    //! GRADIENT

    let image = document.createElement("img")
    image.classList.add("image")
    //! IMAGE

    let bottom = document.createElement("div")
    bottom.classList.add("bottom")

    let title = document.createElement("h2")
    title.classList.add("title")
    title.textContent = data.title

    bottom.appendChild(title)
    top.appendChild(blend)
    top.appendChild(image)

    design.appendChild(top)
    design.appendChild(bottom)

    rippleContainer.appendChild(fallback)
    rippleContainer.appendChild(background)
    rippleContainer.appendChild(design)

    if (animate) {
        rippleContainer.classList.add("animatedRipple")
    }

    return rippleContainer
}