// 1. Create a variable to store the count
let count = 0;

// 2. Define the function (the action)
function countUp() {
    // Increase the count by 1
    count = count + 1;
    
    // Log it to the console (so you can verify it works)
    console.log(count);
    
    // Update the HTML to show the new number
    document.querySelector("h1").innerText = count;
}