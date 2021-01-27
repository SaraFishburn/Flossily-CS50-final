document.addEventListener('DOMContentLoaded', function() 
{
        expandCollapse("floss-range")
        expandCollapse("anchor")
})

function expandCollapse(id)
{
    let option = document.getElementById(id)
    let icon = document.getElementById(`${id}-expand-collapse`)
    let div = document.getElementById(`${id}-options`)

    option.addEventListener("click", function()
    {
        if(div.classList.contains("hide"))
        {
            icon.classList.add("rotate-collapse")
            div.classList.remove("hide")
        }
        else
        {
            icon.classList.remove("rotate-collapse")
            div.classList.add("hide")
        }
    })
}