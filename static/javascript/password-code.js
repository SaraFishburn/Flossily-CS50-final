document.addEventListener('DOMContentLoaded', function()
{
    document.querySelector("#code-form").addEventListener("submit", verifyCode)
    removeErrors('code')
})

function verifyCode(e) 
{
    e.preventDefault()
    
    startLoading('verify-button')
    axios(
        {
            method: 'post',
            url: '/verify_code',
            data: new FormData(e.currentTarget)
        })
        
    .then(function(response) 
    {
        window.location.href = response.request.responseURL;
    })

    .catch(function(error) 
    {
        stopLoading('verify-button')
        let errors = error.response.data.errors
        if(errors.includes('Code has expired')) 
        {
            let messageBox = document.getElementById('code-error')

            messageBox.textContent = '*Code has expired, please send new code'
            messageBox.classList.remove("hide")
        }
        else if(errors.includes('Incorrect code'))
        {
            let messageBox = document.getElementById('code-error')
    
            messageBox.textContent = '*Incorrect code'
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