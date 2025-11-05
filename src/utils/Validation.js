

export const onlyAlphabets = (event) => {
 const key = event.key;
  const allowedKeys = ['Backspace', ' ', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (/^[a-zA-Z\s]$/.test(key) || allowedKeys.includes(key)) {
    return; 
  }
  event.preventDefault();
}

export const onlyNumber = (event) => {
  const key = event.key;
  if (!/^\d$/.test(key) && !['Backspace', 'Tab', 'Enter'].includes(key)) {
    event.preventDefault();
  }
}