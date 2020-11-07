let sleep = function(time) 
{
    return new Promise(function(r) {
      setTimeout(r, time)
    })
}

function startLoading(id)
{
  let button = document.getElementById(id)
  let message = button.dataset.loading

  button.classList.add('sending')
  button.disabled = true
  button.querySelector('#text').textContent = `${message}...`
}

function stopLoading(id)
{
  let button = document.getElementById(id)
  let message = button.dataset.default

  button.classList.remove('sending')
  button.disabled = false
  button.querySelector('#text').textContent = `${message}`

}

function showPassword()
{
  let password = document.getElementById('password-input')

  if(password.type == 'password')
  {
    password.type = 'text'
  }
  else
  {
    password.type = 'password'
  }


}