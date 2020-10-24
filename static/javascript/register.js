document.addEventListener('DOMContentLoaded', function() 
{
    document.querySelector("#register-form").addEventListener("submit", emailError)
    document.querySelector("#register-form").addEventListener("submit", passwordError)
    document.querySelector("#register-form").addEventListener("submit", confirmError)
})

function validateEmail()
{
    let inputText = document.getElementById('email-input')

    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if(inputText.value.match(mailformat))
    {
        return true
    }
    else
    {
        return false
    }
}


function emailError(e)
{
    let inputText = document.getElementById('email-input')
    let messageBox = document.getElementById('email-error')

    if(inputText.value.length == 0)
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide email'
        e.preventDefault()
    }
    else if(!validateEmail())
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Invalid email format'
        e.preventDefault()
    }
}

function validatePassword() 
{ 
    var password = document.getElementById("password-input").value 

    if (password.match(/[a-z]/g) && password.match( 
            /[A-Z]/g) && password.match( 
            /[0-9]/g) && password.match( 
            /[^a-zA-Z\d]/g) && password.length >= 8) 
        return true 
    else 
        return false 
}

function passwordError(e)
{
    let messageBox = document.getElementById('password-error')
    var password = document.getElementById("password-input").value

    if(password.value == "")
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide password'
        e.preventDefault()
    }
    else if(!validatePassword())
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Password must be 8 characters long including \
                                    at least 1 uppercase character, 1 lowercase \
                                    character, 1 digit, and 1 symbol."
        e.preventDefault()
    }
}

function confirmError(e)
{
    var password = document.getElementById("password-input").value 
    var confirm = document.getElementById("confirm-input").value
    let messageBox = document.getElementById('confirm-error')

    if(password != confirm)
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Fields do not match"
        e.preventDefault()
    }
    else if(confirm == "")
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Password confirmation required"
        e.preventDefault()
    }

}




