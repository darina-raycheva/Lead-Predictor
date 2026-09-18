document.querySelectorAll('input[type="range"]').forEach((range) => {
  const output = range.parentElement.querySelector('output');

  const updateOutput = () => {
    output.value = `${Number(range.value).toFixed(2)}%`;
    output.textContent = output.value;
  };

  range.addEventListener('input', updateOutput);
  updateOutput();
});
