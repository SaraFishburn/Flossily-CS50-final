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