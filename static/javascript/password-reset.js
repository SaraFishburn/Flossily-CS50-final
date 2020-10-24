document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('form').addEventListener('submit', startSending)
})

function startSending()
{
    startLoading('send-button')
}

