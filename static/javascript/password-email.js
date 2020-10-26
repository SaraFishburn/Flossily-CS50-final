document.addEventListener('DOMContentLoaded', function()
{
    document.querySelector("#email-form").addEventListener("submit", confirmEmail)
    removeErrors('email')
})

function confirmEmail(e) 
{
    e.preventDefault()
    
    startLoading('send-button')
    axios(
        {
            method: 'post',
            url: '/verify_email',
            data: new FormData(e.currentTarget)
        })
        
    .then(function(response) 
    {
        window.location.href = response.request.responseURL;
    })

    .catch(function(error) 
    {
        stopLoading('send-button')
        let errors = error.response.data.errors
        if(errors.includes('Email does not exist')) 
        {
            let messageBox = document.getElementById('email-error')

            messageBox.textContent = '*No Prep account attached to this email'
            messageBox.classList.remove("hide")
        }
    })


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