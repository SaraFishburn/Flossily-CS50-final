document.addEventListener('DOMContentLoaded', function() 
{
    let modals = [...document.getElementsByClassName('modal')]
    let logins = [...document.getElementsByClassName('open-login')]
    let joins = [...document.getElementsByClassName('open-join')]

    for(let modal of modals)
    {
        let id = modal.id
        if(!id) continue

        document.getElementById(`${id}-password-eye`)?.addEventListener('click', function(){passwordVisibility('password', id)})
        document.getElementById(`${id}-confirm-eye`)?.addEventListener('click', function(){passwordVisibility('confirm', id)})

        document.getElementById(`${id}-close`)?.addEventListener('click', function(){closeCrossModal(id)})
        document.getElementById(id).addEventListener('click', function(e){closeClickModal(e, id)})

        document.getElementById("forgot-password").addEventListener('click', function(){openModal("email", id)})

        
        for(let login of logins)
        {
            login.addEventListener('click', function(){openModal("login", id)})
        }
    
        for(let join of joins)
        {
            join.addEventListener('click', function(){openModal("join", id)})
        }
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
    resetForm(id)
    clearAllErrors(id)
}

function closeClickModal(event, id)
{
    let modal = document.getElementById(id)
    
    if (event.target.id === "modal-contents")
    {
        modal.style.display = "none"
        resetForm(id)
        clearAllErrors(id)
    }
}

function openModal(modal, id)
{
    let elements = [...document.getElementsByClassName('modal')]

    for(let element of elements)
    {
        element.style.display = "none"
    }

    let page = document.getElementById(modal)
    page.style.display = 'flex'

    resetForm(id)
    clearAllErrors(id)
}

function resetForm(id)
{
    document.getElementById(`${id}-form`).reset()
}