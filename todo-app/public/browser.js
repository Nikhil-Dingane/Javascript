function itemTemplate(item) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
    <button data-id="${item._id}"class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
    <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
    </li>`;
}

// iNitial page load render
let ourHTML = items.map(function(item) {
    return itemTemplate(item)
}).join("")
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)

let creatField = document.getElementById("create-field")
document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault()
    axios.post("/create-item", { text: creatField.value }).then(function(response) {
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        creatField.value = ""
        creatField.focus()
    }).catch(function() {
        alert("Please try again later")
    })
})
document.addEventListener("click", (e) => {

    if (e.target.classList.contains("delete-me")) {
        axios.post("delete-item", { id: e.target.getAttribute("data-id") }).then((value) => {
            e.target.parentElement.parentElement.remove()
        })
    }

    if (e.target.classList.contains("edit-me")) {
        let userInput = prompt("Enter you desired text:", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
        axios.post("/update-item", { text: userInput, id: e.target.getAttribute("data-id") }).then((value) => {
            e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
        })
    }
})