// Imports & Variables

import { call } from "./pnode.js";
const colorThief = new ColorThief();
const ripplesContainer = document.getElementById("ripples");
const add = document.getElementById("add");
let regPopup = "none";

let active;

let locate = {};

const days = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday"
}

const th = {
    "0": "th",
    "1": "st",
    "2": "nd",
    "3": "rd",
    "4": "th",
    "5": "th",
    "6": "th",
    "7": "th",
    "8": "th",
    "9": "th"
}

const emotionColors = {
    angry: ["Fiery crimson", "Scarlet blaze", "Burning ruby", "Volcanic red", "Ember glow"],
    sad: ["Misty blue", "Dusky slate", "Weathered denim", "Faded navy", "Stormy gray"],
    hopeful: ["Golden sunrise", "Buttercup yellow", "Pale daffodil", "Warm honey", "Sunbeam glow"],
    anxious: ["Twilight lavender", "Dusky orchid", "Muted violet", "Faded lilac", "Hazy purple"],
    calm: ["Seafoam green", "Misty sage", "Soft jade", "Pale aqua", "Dewy moss"],
    lonely: ["Dusty periwinkle", "Faded cornflower", "Washed indigo", "Pale twilight", "Misty bluebell"],
    grateful: ["Blushing rose", "Soft peach", "Warm coral", "Dusty rose", "Pale salmon"],
    reflective: ["Powder blue", "Morning sky", "Iceberg white", "Frosted lake", "Quartz blue"],
    overwhelmed: ["Sunset orange", "Warm apricot", "Peach blush", "Autumn leaf", "Soft terracotta"],
    excited: ["Vibrant gold", "Sunflower yellow", "Lemon zest", "Goldenrod", "Radiant amber"],
    joyful: ["Sunny marigold", "Bright daisy", "Golden poppy", "Warm butter", "Radiant saffron"],
    peaceful: ["Morning mist", "Pale seaglass", "Soft celadon", "Dewdrop green", "Whispering pine"],
    nostalgic: ["Antique rose", "Faded parchment", "Vintage mauve", "Sepia tone", "Old lace"],
    confident: ["Royal amethyst", "Deep sapphire", "Majestic plum", "Rich eggplant", "Regal violet"],
    surprised: ["Electric lime", "Vibrant mint", "Neon seafoam", "Glowing jade", "Shocking teal"],
    fearful: ["Shadow gray", "Deep charcoal", "Midnight ink", "Storm cloud", "Ashen smoke"],
    loving: ["Blushing pink", "Soft rose", "Warm strawberry", "Dusty rose", "Tender mauve"],
    jealous: ["Acid green", "Olive drab", "Mossy lime", "Swampy khaki", "Pistachio shade"],
    playful: ["Bubblegum pink", "Cotton candy", "Peppermint blue", "Lemon drop", "Taffy purple"]
};

let publicStorage = JSON.parse(localStorage.getItem("ripple_data"))
let ripplesAmnt = Object.keys(storage("return", "ripples")).length

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
        case "innerReturn": {
            return publicStorage["ripples"][key]
        }
        case "delete": {
            delete publicStorage["ripples"][key]
            localStorage.setItem("ripple_data", JSON.stringify(publicStorage))
            break
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

const placeholders = ["How was your day?", "Write like no one will ever read it.", "Start anywhere. The first word is enough.", "However you're feeling is valid.", "This journal's always glad to hear from you.", "What's floating around in your mind right now?"]
const date = days[new Date().getDay()].toLowerCase() + " " + new Date().getDate() + th[new Date().getDate().toString().slice(-1)];

function formatShortDate(isoString) {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() % 100;
    return `${day}/${month}/${year}`;
}

async function saveImage(imageUrl) {
    const result = await window.electronAPI.downloadImage(imageUrl)
    if (result.success) {
        return result.filePath
    }
}

async function recieve(message) {
    try {
        const result = await call(message)
        return result
    } catch (error) {
        console.error("Error calling API:", error);
    }
}

function createPrompt(entry) {
    const base = `Hi! You're an AI assistant helping users reflect on their journal entries in an app called Ripple. Based on the user's journal entry below, please return a JavaScript object with two properties: “reflection”: a thoughtful, gentle reflection that responds to the emotional tone of the entry. You can either simply reflect upon the user's writing, or provide a therapeutic response to comfort them (no formatting). “emotions”: an array of 2 emotions that best describe the entry - out of this list only: angry, sad, hopeful, anxious, calm, lonely, grateful, reflective, overwhelmed, excited, joyful, peaceful, nostalgic, confident, surprised, fearful, loving, jealous, playful. Here's the user's entry: "${entry}". Please return just the JavaScript object. Thank you!`
    return base
}

function extract(raw) {
    const cleaned = raw.split("```javascript")[1].split("```")[0];

    try {
        return eval('(' + cleaned + ')');
    } catch (err) {
        console.error("Failed to parse Gemini response:", err);
        return null;
    }
}

const baseIntros = [
    "An abstract, emotional background",
    "A soft and ambient visual mood board",
    "A dreamy and atmospheric color field",
    "A calming, textural canvas of emotion",
    "An impressionistic, grainy background"
]
const colorPhrases = [
    "made of soft, blurred gradients in the following colors",
    "featuring blended tones of",
    "with flowing gradients of",
    "highlighting emotional shades like",
    "built on layered mists of"
]
const detailStyles = [
    "with subtle grain, gentle ripples, and faint analog textures",
    "incorporating soft noise, dotted textures, and ambient haze",
    "inspired by film photography, ambient light, and dusty overlays",
    "with dreamy blur, light bokeh, and whispery lines",
    "including organic imperfections like scratches, dust, and faded patterns"
]

function random(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function getImagePath(emotions) {
    let flat = [];

    emotions.map(emotion => emotion.toLowerCase()).forEach(emotion => {
        if (emotionColors[emotion]) {
            let first = Math.floor(Math.random() * 5);
            let second;
            let result;

            do {
                second = Math.floor(Math.random() * 5);
            } while (second === first);

            result = first.toString() + "|" + second.toString()

            result.split("|").forEach(value => flat.push(emotionColors[emotion][Number(value)]))
        }
    })

    const base = `${random(baseIntros)} ${random(colorPhrases)}: ${flat.join(", ")}. The image is minimalistic and grainy, ${random(detailStyles)}, inspired by ambient light, film textures, and analog photography. Dreamlike and atmospheric.`

    let object = {
        "colors": flat,
        "address": "https://image.pollinations.ai/prompt/" + encodeURIComponent(base) + "?width=400&height=300",
        "prompt": base
    }

    return object
}

function seclude(string) {
    let full = string;
    let want = full.split("ripple_bgs/bg-")[0]
    return full.split(want)[1]
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

function popup(method, popup, cords, details, id) {
    if (method === "show") {
        popups.style.display = "block";

        let toShow = document.getElementById(popup)
        toShow.style.display = "block";

        if (popup !== "search") {
            regPopup = popup;
            toShow.style.animation = "popupShow 0.5s ease";
            setTimeout(() => {
                toShow.style.animation = "";
            }, 500)

            toShow.style.left = `${Number(cords[0]) - 270}px`;
            toShow.style.top = `${Number(cords[1]) - 410}px`;
        } else {
            if (regPopup !== "search") {
                toShow.style.animation = "searchShow 0.5s ease";
                setTimeout(() => {
                    regPopup = "search";
                    toShow.style.animation = "";
                    toShow.querySelector("input").focus();
                }, 500)
            } else {
                regPopup = "none";
                toShow.style.animation = "searchHide 0.5s ease";
                setTimeout(() => {
                    toShow.style.animation = "";
                    toShow.style.display = "none";
                    popups.style.display = "none";
                }, 500)
            }
        }

        if (popup === "create") {
            document.querySelector("#create #createSection").style.display = "block"
            document.querySelector("#create #loadingSection").style.display = "none"

            document.querySelector("#create h1").textContent = date
            document.querySelector("#create img").setAttribute("src", `assets/curtains/curtain${Math.floor(Math.random() * 5)}.png`)
            document.querySelector("#create textarea").value = "";
            document.querySelector("#create textarea").setAttribute("placeholder", placeholders[Math.floor(Math.random() * placeholders.length)]);
            moveSlide(0, true);
        } else if (popup === "details") {

            active = id

            document.querySelector("#details #viewSection").style.display = "block"
            document.querySelector("#details #editSection").style.display = "none"

            document.querySelector("#details h1").textContent = details.title
            document.querySelector("#details .zero").style.backgroundImage = `url(${details.image})`
            document.querySelector("#details img").setAttribute("src", `assets/curtains/curtain${details.curtain}.png`)
            document.querySelector("#details p").textContent = details.content
            document.querySelector("#emotionsText").textContent = details.emotions.join(", ")

            if (details.choice === "reflect") {
                document.querySelector("#details #reflection").style.display = "block"
                document.querySelectorAll("#details h3").forEach(h3 => h3.style.color = `rgba(${details.color.join(", ")})`)
                document.querySelector("#details #reflectionText").style.background = `rgba(${details.color.join(", ")},0.4)`
                document.querySelector("#details #reflectionText p").textContent = details.reflection
            } else {
                document.querySelector("#details #reflection").style.display = "none";
            }
        }

        if (popup !== "search") {
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
        }

    } else {
        let toHide = [
            ...document.querySelectorAll(".popup"),
            ...document.querySelectorAll("#search")
        ]
        toHide.forEach(popup => {
            if (popup.id === "search") {
                popup.style.animation = "searchHide 0.5s ease";
                setTimeout(() => {
                    popup.style.animation = "";
                    popup.style.display = "none";
                    regPopup = "none";
                    popups.style.display = "none";
                }, 490)
            } else {
                popup.style.animation = "popupHide 0.5s ease";
                setTimeout(() => {
                    popup.style.animation = "";
                    popup.style.display = "none";
                    regPopup = "none";
                    popups.style.display = "none";
                }, 490)
            }
        })
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup !== "none") {
        popup("close")
    } else if (e.key.toLowerCase() === 'f' && e.metaKey) {
        popup("show", "search")
    }
});

const popups = document.getElementById("popups")
popups.addEventListener("mousedown", function (e) {
    if (regPopup !== "none" && !e.target.closest(".popup") && e.target.id !== "add") {
        popup("close")
    }
});

const searchBar = document.getElementById("searchbar")
searchBar.addEventListener("input", function (e) {
    Object.entries(locate).forEach((data) => {
        let baseContent = storage("innerReturn", data[0])
        let flat = baseContent.choice + " | " + baseContent.content + " | " + baseContent.title + " | " + baseContent.reflection + " | " + baseContent.date + " | " + baseContent.emotions.join(" ")
        if (flat.toLowerCase().includes(searchBar.value.toLowerCase())) {
            data[1].style.opacity = "1"
        } else {
            data[1].style.opacity = "0.5"
        }
    })
})

function pageFlip(from, to, toTypeDisplay) {
    from.style.animation = "simpleHide 0.5s ease"
    setTimeout(() => {
        from.style.display = "none"
        from.style.animation = ""
    }, 490)

    to.style.opacity = "0";
    to.style.display = toTypeDisplay;

    setTimeout(() => {
        requestAnimationFrame(() => {
            to.style.animation = "simpleShow 0.5s ease";
            setTimeout(() => {
                to.style.animation = "";
                to.style.opacity = "";
            }, 490);
        });
    }, 510);
}

const editButton = document.getElementById("edit");
const deleteButton = document.getElementById("delete");

const saveButton = document.getElementById("editSubmit");

editButton.addEventListener("click", () => {
    pageFlip(document.querySelector("#details #viewSection"), document.querySelector("#details #editSection"), "block")

    document.querySelector("#editText").value = JSON.stringify(storage("innerReturn", active), null, 2)
})

saveButton.addEventListener("click", () => {
    storage("ripple", active, JSON.parse(document.querySelector("#editText").value))
    home(true)
    popup("close")
})

deleteButton.addEventListener("click", () => {
    storage("delete", active)
    home(true)
    popup("close")
})

const createSubmit = document.getElementById("createSubmit");
createSubmit.addEventListener("click", () => {
    if (document.getElementById("createText").value.trim() !== "") {
        pageFlip(document.querySelector("#create #createSection"), document.querySelector("#create #loadingSection"), "flex")

        recieve(createPrompt(document.querySelector("#create textarea").value)).then(result => {
            console.log(result)
            let pathInfo = getImagePath(extract(result).emotions)
            saveImage(pathInfo.address).then(imagePath => {
                console.log(imagePath)
                let theifColor;
                let extractImage = document.createElement("img");
                extractImage.setAttribute("crossorigin", "anonymous");
                extractImage.style.display = "none";
                extractImage.setAttribute("src", seclude(imagePath));
                extractImage.addEventListener("load", () => {
                    theifColor = colorThief.getColor(extractImage);
                    let createDate = new Date().toISOString()

                    let id = createID()
                    let newRipple = {
                        "title": date,
                        "date": createDate,
                        "content": document.getElementById("createText").value,
                        "curtain": document.querySelector("#create img").getAttribute("src").split("curtains/curtain")[1].split(".png")[0],
                        "image": seclude(imagePath),
                        "choice": document.querySelector(".slide").style.transform === "translateY(0px)" ? "keep" : "reflect",
                        "reflection": extract(result).reflection,
                        "emotions": extract(result).emotions,
                        "colors": pathInfo.colors,
                        "id": id,
                        "prompt": pathInfo.prompt,
                        "color": theifColor
                    }

                    storage("update", "lastReflection", createDate)

                    extractImage.remove()
                    popup("close")
                    ripplesContainer.insertBefore(createRipple(null, newRipple, true), add)
                    add.style.display = "none";

                    storage("ripple", id, newRipple)
                })
            })
        })
    }
})

add.addEventListener("click", function (e) {

    if (popup === "create") {
        popup("close")
    } else {
        popup("show", "create", [e.clientX, e.clientY])
    }

})

function home(silent) {
    locate = {}
    ripplesContainer.querySelectorAll(".ripple").forEach(ripple => ripple.remove())
    add.style.display = "none";

    const ripplesRaw = Object.entries(storage("return", "ripples"));
    const toDraw = ripplesRaw.sort((a, b) => {
        return new Date(a[1].date) - new Date(b[1].date);
    });

    const speed = 250;

    let animate = [];
    let nonAnimated = [];

    if (silent) {
        nonAnimated = toDraw;
    } else {
        nonAnimated = toDraw.slice(0, Math.max(0, toDraw.length - 11));
        animate = toDraw.slice(-11);
    }

    let animLength = Object.keys(animate).length
    let totalLength = Object.keys(animate).length + Object.keys(nonAnimated).length

    nonAnimated.forEach(([id, data], index) => {
        let craft = createRipple(id, data, false)
        locate[id] = craft
        if ((index + 1) === totalLength) {
            storage("update", "lastReflection", data.date)
        }
        ripplesContainer.insertBefore(craft, add)
    })

    animate.forEach(([id, data], index) => {
        setTimeout(() => {
            let craft = createRipple(id, data, true)
            locate[id] = craft
            if ((index + 1) === totalLength) {
                storage("update", "lastReflection", data.date)
            }
            ripplesContainer.insertBefore(craft, add)
            ripplesContainer.scrollTo({
                top: ripplesContainer.scrollHeight,
                behavior: "smooth"
            });
        }, index * speed)
    })

    let writtenToday = formatShortDate(storage("return", "lastReflection")) === formatShortDate(new Date().toISOString()) ? true : false

    if (!writtenToday) {
        if (silent) {
            add.classList.add("animatedRipple");
            add.style.display = "flex";
        } else {
            setTimeout(() => {
                add.classList.add("animatedRipple");
                add.style.display = "flex";
            }, (animLength * speed) + speed);
        }
    }
}

if (ripplesAmnt > 0) {
    home(false)
}

function createRipple(id, data, animate) {
    let rippleContainer = document.createElement("div")
    rippleContainer.classList.add("ripple")

    let fallback = document.createElement("div")
    fallback.classList.add("fallback")

    let background = document.createElement("div")
    background.classList.add("background")
    background.style.background = `rgba(${data.color.join(", ")})`

    let design = document.createElement("div")
    design.classList.add("design")

    let top = document.createElement("div")
    top.classList.add("top")

    let blend = document.createElement("div")
    blend.classList.add("blend")
    blend.style.background = `linear-gradient(180deg,rgba(${data.color.join(", ")}, 0) 0%, rgba(${data.color.join(", ")}, 1) 100%)`

    let image = document.createElement("img")
    image.classList.add("image")
    image.setAttribute("src", data.image)

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

    rippleContainer.addEventListener("click", (e) => {
        popup("show", "details", [e.clientX, e.clientY], data, id)
    })

    if (animate) {
        rippleContainer.classList.add("animatedRipple")
    }

    return rippleContainer
}
