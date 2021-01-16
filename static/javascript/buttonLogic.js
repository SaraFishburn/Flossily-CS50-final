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
  // button.innerHTML = `${message}`

  let counter = 0;

  return window.setInterval(function() {
      counter += 1
      button.style.width = "115px"
      button.style.textAlign = "left"
      button.innerHTML = `${message}`+'.'.repeat(counter % 4)
  }, 500);

}

function stopLoading(id, interval)
{
  let button = document.getElementById(id)
  let message = button.dataset.default

  button.classList.remove('sending')
  button.disabled = false

  button.style.width = null
  button.style.textAlign = null
  button.innerHTML = `${message}`

  window.clearInterval(interval)
}