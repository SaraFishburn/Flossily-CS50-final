document.addEventListener('DOMContentLoaded', function() 
{
    document.querySelector("#register-form").addEventListener("submit", registerAccount)
    removeErrors('email')
    removeErrors('password')
    removeErrors('confirm')
})

function registerAccount(e) 
{
    e.preventDefault()

    emailError()
    passwordError()
    confirmError()
    
    axios(
        {
            method: 'post',
            url: '/register',
            data: new FormData(e.currentTarget)
        })
        
        .then(function(response) 
        {
            window.location.href = response.request.responseURL;
        })
        
        .catch(function(error) 
        {
            let errors = error.response.data.errors
            console.log(errors)
            if(errors.includes('Email is already in use')) 
            {
                let messageBox = document.getElementById('email-error')
                
                messageBox.textContent = '*Email already in use'
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
    }
    else if(!validateEmail())
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Invalid email format'
    }
}

function validatePassword() 
{ 
    var password = document.getElementById("password-input").value 

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

function passwordError()
{
    let messageBox = document.getElementById('password-error')
    var password = document.getElementById("password-input").value

    if(password == "")
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = '*Must provide password'
    }
    else if(!validatePassword())
    {
        messageBox.classList.remove("hide")
        messageBox.textContent = "*Password must be between 8 and 128 characters long including \
                                    at least 1 uppercase character, 1 lowercase \
                                    character, 1 digit, and 1 symbol."
    }
}

function confirmError()
{
    var password = document.getElementById("password-input").value 
    var confirm = document.getElementById("confirm-input").value
    let messageBox = document.getElementById('confirm-error')

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




