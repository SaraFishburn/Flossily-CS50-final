document.addEventListener('DOMContentLoaded', function() 
{
    let modals = [...document.getElementsByClassName(`modal`)]

    for(let modal of modals)
    {
        let id = modal.id
        if(!id) continue

        document.getElementById(`${id}-form`)?.addEventListener("submit", function(e){activate(e, id)})
        removeErrors('email', id)
        removeErrors('password', id)
        removeErrors('confirm', id)
        removeErrors('code', id)
    }
})

function activate(e, id)
{
    e.preventDefault()
    let emailErrors, passwordErrors, confirmErrors, loadingInterval

    if(id === "join" || id === "login" || id === "email")
    {
        emailErrors = emailError(id)
    }

    if(id === "join" || id === "login" || id === "reset")
    {
        passwordErrors = passwordError(id)
    }
    
    if(id === "join" || id === "reset")
    {
        confirmErrors = confirmError(id)
    }
    
    if(emailErrors || passwordErrors || confirmErrors) return

    if(id === "email" || id === "code" || id === "new-code")
    {
        loadingInterval = startLoading(`${id}-button`)
    }

    axios(
        {
            method: 'post',
            url: `/${id}`,
            data: new FormData(e.currentTarget)
        })
        .then(function(response)
        {
            let targetModalId = e.target.getAttribute('data-target-modal')
            if(!targetModalId)
            {
                window.location.href = response.request.responseURL
            }
            else
            {
                stopLoading(`${id}-button`, loadingInterval)
                openModal(targetModalId)
                resetForm(id)
                clearAllErrors(id)
            }
        })
        .catch(function(error) 
        {
            if(!error.response) return
            let errors = error.response.data.errors
            
            if(id === "join")
            {

                if(errors?.includes('Email is already in use')) 
                {
                    let messageBox = document.getElementById(`${id}-email-error`)
                    
                    messageBox.textContent = '*Email already in use'
                    messageBox.classList.remove("hide")
                }
            }
            else if(id === "login")
            {
                if(errors?.includes('Account locked'))
                {
                    let messageBox = document.getElementById(`${id}-email-error`)

                    messageBox.textContent = '*Account currently locked, please try again later'
                    messageBox.classList.remove("hide")
                }
                else if(errors?.includes('Too many attempts'))
                {
                    let messageBox = document.getElementById(`${id}-email-error`)

                    messageBox.textContent = '*Account has now been locked due to too many login attempts, please try again in 30 minutes'
                    messageBox.classList.remove("hide")
                }
                else if(errors?.includes('Incorrect password'))
                {
                    let messageBox = document.getElementById(`${id}-password-error`)

                    messageBox.textContent = '*Password is incorrect'
                    messageBox.classList.remove("hide")
                }
            }
            if(id === "login" || id == "email")
            {
                if(errors?.includes('Email does not exist')) 
                {
                    let messageBox = document.getElementById(`${id}-email-error`)

                    messageBox.textContent = '*No Flossily account attached to this email'
                    messageBox.classList.remove("hide")
                }
            }
            if(id == "email")
            {
                stopLoading(`${id}-button`, loadingInterval)
            }
            else if(id === "code")
            {
                stopLoading(`${id}-button`, loadingInterval)
                if(errors?.includes('Code has expired')) 
                {
                    let messageBox = document.getElementById('code-code-error')

                    messageBox.textContent = '*Code has expired, please send new code'
                    messageBox.classList.remove("hide")
                }
                else if(errors?.includes('Incorrect code'))
                {
                    let messageBox = document.getElementById('code-code-error')
            
                    messageBox.textContent = '*Incorrect code'
                    messageBox.classList.remove("hide")
                }
            }
            else if(id === "new-code")
            {
                stopLoading(`${id}-button`)
            }
        })
}

function validateEmail(id)
{
    let inputText = document.getElementById(`${id}-email-input`)

    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if(inputText?.value.match(mailformat))
    {
        return true
    }
    else
    {
        return false
    }
}

function emailError(id)
{
    let inputText = document.getElementById(`${id}-email-input`)
    let messageBox = document.getElementById(`${id}-email-error`)

    if(!messageBox || !inputText) return
    
    if(inputText.value.length == 0)
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide email'
        return true
    }
    else if(!validateEmail(id))
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Invalid email format'
        return true
    }
    return false
}

function validatePassword(id) 
{ 
    var password = document.getElementById(`${id}-password-input`).value 

    if(
        password.match(/[a-z]/g) &&
        password.match(/[A-Z]/g) &&
        password.match(/[0-9]/g) &&
        password.match(/[^a-zA-Z\d]/g) &&
        password.length >= 8
    ) 
        return true 
    else
        return false 
}

function passwordError(id)
{
    let messageBox = document.getElementById(`${id}-password-error`)
    var password = document.getElementById(`${id}-password-input`).value

    if(password === "")
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide password'
        return true
    }
    else if(id !== "login" && !validatePassword(id))
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Password must be between 8 and 128 characters long including \
                                    at least 1 uppercase character, 1 lowercase \
                                    character, 1 digit, and 1 symbol."
    }
    return false
}

function confirmError(id)
{
    var password = document.getElementById(`${id}-password-input`).value 
    var confirm = document.getElementById(`${id}-confirm-input`).value
    let messageBox = document.getElementById(`${id}-confirm-error`)

    if(password != confirm)
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Fields do not match"
    }
    else if(confirm == "")
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Password confirmation required"
    }
}

function removeErrors(elName, id)
{
    let inputEl = document.getElementById(`${id}-${elName}-input`)
    let errorEl = document.getElementById(`${id}-${elName}-error`)
    
    inputEl?.addEventListener('keydown', function()
    {
      errorEl.classList.add('hide')
      errorEl.textContent = 'TODO'
    })
}

function clearAllErrors(id)
{
    let array = [
        document.getElementById(`${id}-email-error`),
        document.getElementById(`${id}-password-error`),
        document.getElementById(`${id}-confirm-error`),
        document.getElementById(`${id}-code-error`)
    ]

    for(element of array)
    {
        if(!element) continue
        element.classList.add('hide')
        element.textContent = 'TODO'
    }
}
