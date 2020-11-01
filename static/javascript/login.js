document.addEventListener('DOMContentLoaded', function() 
{
    document.querySelector("#login-form").addEventListener("submit", login)
    removeErrors('email')
    removeErrors('password')
})

function login(e) 
{
    e.preventDefault()

    let emailErrors = emailError()
    let passwordErrors = passwordError()

    if(emailErrors || passwordErrors)
    {
        return
    }
    
    axios(
    {
        method: 'post',
        url: '/login',
        data: new FormData(e.currentTarget)
    })

    .then(function(response) 
    {
        window.location.href = response.request.responseURL;
    })

    .catch(function(error) 
    {
        let errors = error.response.data.errors
        if(errors.includes('Email does not exist')) 
        {
            let messageBox = document.getElementById('email-error')

            messageBox.textContent = '*No Prep account attached to this email'
            messageBox.classList.remove("hide")
        }
        else if(errors.includes('Account locked'))
        {
            let messageBox = document.getElementById('email-error')

            messageBox.textContent = '*Account currently locked, please try again later'
            messageBox.classList.remove("hide")
        }
        else if(errors.includes('Too many attempts'))
        {
            let messageBox = document.getElementById('email-error')

            messageBox.textContent = '*Account has now been locked due to too many login attempts, please try again in 30 minutes'
            messageBox.classList.remove("hide")
        }
        else if(errors.includes('Incorrect password'))
        {
            let messageBox = document.getElementById('password-error')

            messageBox.textContent = '*Password is incorrect'
            messageBox.classList.remove("hide")
        }
    })
}

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

function emailError()
{
    let inputText = document.getElementById('email-input')
    let messageBox = document.getElementById('email-error')

    if(inputText.value.length == 0)
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide email'
        return true
    }
    else if(!validateEmail())
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Invalid email format'
        return true
    }
    return false
}

function passwordError()
{
    let messageBox = document.getElementById('password-error')
    var password = document.getElementById("password-input").value

    if(password == "")
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide password'
        return true
    }
    return false
}

function removeErrors(elName)
{
    let inputEl = document.getElementById(`${elName}-input`)
    let errorEl = document.getElementById(`${elName}-error`)
  
    inputEl.addEventListener('keydown', function()
    {
      errorEl.classList.add('hide')
      errorEl.textContent = ''
    })
}
