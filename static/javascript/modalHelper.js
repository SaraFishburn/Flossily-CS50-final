document.addEventListener('DOMContentLoaded', function() 
{
    let modals = [...document.getElementsByClassName(`modal`)]

    for(let modal of modals)
    {
        let id = modal.id
        if(!id) continue

        document.getElementById(`${id}-password-eye`)?.addEventListener('click', function(){passwordVisibility('password', id)})
        document.getElementById(`${id}-confirm-eye`)?.addEventListener('click', function(){passwordVisibility('confirm', id)})

        document.getElementById("join-btn").addEventListener('click', function(){openModal("join")})
        document.getElementById("login-btn").addEventListener('click', function(){openModal("login")})
        document.getElementById("join-nav-link").addEventListener('click', function(){openModal("join")})
        document.getElementById("login-nav-link").addEventListener('click', function(){openModal("login")})

        document.getElementById(`${id}-close`)?.addEventListener('click', function(){closeCrossModal(id)})
        document.getElementById(id).addEventListener('click', function(e){closeClickModal(e, id)})
    }
})

function passwordVisibility(elname, id)
{
    let eye = document.getElementById(`${id}-${elname}-eye`)
    let text = document.getElementById(`${id}-${elname}-input`)

    if(eye.textContent === "visibility_off")
    {
        eye.textContent = "visibility"
        text.setAttribute("type", "text")
    }
    else
    {
        eye.textContent = "visibility_off"
        text.setAttribute("type", "password")
    }
}

function closeCrossModal(id)
{
    let modal = document.getElementById(id)

    modal.style.display = "none"
}

function closeClickModal(event, id)
{
    let modal = document.getElementById(id)

    if (event.target.id === "modal-contents")
    {
        modal.style.display = "none"
    }
}

function openModal(modal)
{
    let page = document.getElementById(modal)

    page.style.display = 'flex'

}